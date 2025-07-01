#logic for calling chatbot

import os
from openai import OpenAI
from dotenv import load_dotenv
from ai_instructions import dev_system_instr

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_ai_response(user_message, conversation_history=None):
    """
    Basic function to give our chatbot instructions, and also store message history.

    Question is, is it efficient?
    """
    messages = [{"role": "system", "content": dev_system_instr}]
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    return completion.choices[0].message.content
