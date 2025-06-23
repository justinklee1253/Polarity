#logic for calling chatbot

import os
from openai import OpenAI
from dotenv import load_dotenv
from ai_instructions import dev_system_instr

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

completion = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
      {"role": "system", 
       "content": dev_system_instr},
       {"role": "user",
        "content": "I make $850 a month from my work study job on campus. How should I save for a trip to Korea that costs $3,500 in 8 months?" },
  ]
)

print(completion.choices[0].message.content)