from flask import Blueprint, request, jsonify, current_app, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, jwt_required, get_jwt_identity
from datetime import datetime
from .ai_service import get_ai_response
from ..database import get_db_session
from ..models import Conversations, Messages, User

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')

@chat_bp.route('/conversations', methods=["POST"])
@jwt_required()
def create_conversation(): 
    """
    1.When user presses new chat, or types inside "What Can I Help with?" input box
    2.Create new conversation within database (unique id), created_at, last_modified, title: initially New conversation (# them), user_id
    """
    user_id = get_jwt_identity() 
    try: 
        with get_db_session() as db:
            user = db.query(User).get(user_id) 

            if not user: 
                return jsonify({"message": "User not found"}), 404

            data = request.get_json() or {}
            title = data.get('title')
            if not title:
                count = db.query(Conversations).filter_by(user_id=user_id).count() + 1
                title = f"New Conversation {count}"
            
            #user is found, we have conversations.user_id as a FK referencing users.id. We want to create new convo tied to user
            new_convo = Conversations(
                user_id=user_id,
                title=title
            )
            db.add(new_convo)
            db.commit()
            db.refresh(new_convo)

            return jsonify({
                "id": new_convo.id,
                "title": new_convo.title,
                "created_at": new_convo.created_at,
                "last_modified": new_convo.last_modified,
            }), 201

    except Exception as e:
        return jsonify({"error": "Failed to create conversation"}), 500

@chat_bp.route('/conversations', methods=["GET"])
@jwt_required()
def get_conversations():
    """
    Upon spark.jsx loading, we should be able to get all conversations that a user has.
    """
    user_id = get_jwt_identity()
    try:
        with get_db_session() as db:
            #we want to get the user, and then get all conversations tied to user 
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            #if the user is found, find all conversations with that user
            #search conversations with the same user_id --> 
            conversations = user.conversations #lists all conversation objects in DB associated with user (where conversations.user_id == user.id)

            convo_list = [
                {
                    "id": convo.id,
                    "title": convo.title,
                    "created_at": convo.created_at,
                    "last_modified": convo.last_modified
                }
                for convo in conversations
            ]
            return jsonify(convo_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch conversations"}), 500

@chat_bp.route('/conversations/<int:id>', methods=["GET"])
@jwt_required()
def get_specific_conversation(id):
    user_id = get_jwt_identity()
    try:
        with get_db_session() as db:
            convo = db.query(Conversations).filter_by(id=id, user_id=user_id).first() #find matching convo with id and correct user
            if not convo:
                return jsonify({"error": "Conversation not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to fetch conversation"}), 500


@chat_bp.route('/conversations/<int:id>', methods=["DELETE"])
@jwt_required()
def delete_conversation(id):
    """
    Delete a conversation by id for the authenticated user. 
    """
    user_id = get_jwt_identity()
    try:
        with get_db_session() as db:
            convo = db.query(Conversations).filter_by(id=id, user_id=user_id).first() #find a conversation where id matches id specified by /route and user_id matches user_id from JWT
            if not convo:
                return jsonify({"error": "Conversation not found"}), 404
            db.delete(convo)
            db.commit()
            return jsonify({"message": "Conversation deleted"}), 200
            
    except Exception as e:
        return jsonify({"error": "Failed to delete conversation"}), 500


@chat_bp.route('/conversations/<int:id>/messages', methods=["POST"])
@jwt_required()
def send_user_message(id):
    user_id = get_jwt_identity()
    data = request.get_json()
    try:
        with get_db_session() as db:
            convo = db.query(Conversations).filter_by(id=id, user_id=user_id).first()
            if not convo:
                return jsonify({"error": "Conversation not found"}), 404
            user_message = data.get('message')
            if not user_message:
                return jsonify({"error": "No message content found"}), 400

            # Save user message
            user_msg_obj = Messages(
                convo_id=convo.id,
                sender="user",
                content=user_message
            )
            db.add(user_msg_obj)
            db.commit()
            db.refresh(user_msg_obj)

            # Build history for LLM
            messages = db.query(Messages).filter_by(convo_id=convo.id).order_by(Messages.created_at).all()
            history = []
            for msg in messages:
                role = "user" if msg.sender == "user" else "assistant"
                history.append({"role": role, "content": msg.content})

            # Get LLM response
            ai_response = get_ai_response(user_message, conversation_history=history)

            # Save AI response
            ai_msg_obj = Messages(
                convo_id=convo.id,
                sender="assistant",
                content=ai_response
            )
            db.add(ai_msg_obj)
            db.commit()
            db.refresh(ai_msg_obj)

            # Update conversation's last_modified
            convo.last_modified = ai_msg_obj.created_at
            db.commit()

            return jsonify({"response": ai_response}), 200
    except Exception as e:
        print("Error in send_user_message:", e)
        return jsonify({"error": "Failed to process message"}), 500


@chat_bp.route('/conversations/<int:id>/messages', methods=["GET"])
@jwt_required()
def get_all_conversation_messages(id):
    """
    When user clicks on conversation, we need to get all messages that are part of that conversation so we can load them in.
    """
    user_id = get_jwt_identity()  # JWT token created upon login + identity of it is tied to user_id from db
    try:
        with get_db_session() as db:
            convo = db.query(Conversations).filter_by(id=id, user_id=user_id).first()
            if not convo:
                return jsonify({"error": "Conversation not found"}), 404

            messages_in_convo = db.query(Messages).filter_by(convo_id=convo.id).order_by(Messages.created_at).all()

            messages_list = [
                {
                    "id": msg.id,
                    "sender": msg.sender,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat() if msg.created_at else None, #JSON serialization for datetime not DEFAULT
                    #.isoformat() converts datetime --> '2025-07-01T15:30:00' so that it is readable from frontend when we send response 
                }
                for msg in messages_in_convo
            ]

            return jsonify(messages_list), 200 #messages_list = {{...}, {...}, {....}}
    except Exception as e:
        return jsonify({"error": "Failed to fetch messages"}), 500

