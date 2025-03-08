import difflib
import re
from indicnlp.tokenize import indic_tokenize


def tokenize(text):
    return list(indic_tokenize.trivial_tokenize(text, lang="ne"))

def compare_texts(transcription, user_input):



    trans_words = tokenize(transcription.lower())
    input_words = tokenize(user_input.lower())
    original_input_words = tokenize(user_input)
    
    matcher = difflib.SequenceMatcher(None, input_words, trans_words)
    
    output = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for k in range(i1,i2):
                output.append((original_input_words[k], "correct")) #original

        elif tag == "replace":
            for k in range(i1,i2):
                output.append((original_input_words[k], "incorrect")) #original

        elif tag == "delete":
            for k in range(i1,i2):
                output.append((original_input_words[k], "incorrect")) #original

        elif tag == "insert":
            pass  # Ignore extra words in transcription

    # **Handling Correct Words with ±2 Position Check**
    for i, (word, status) in enumerate(output):
        if status == "incorrect":  # Only check incorrect words
            for j in range(max(0, i - 2), min(len(trans_words), i + 3)):  # Look within ±2 words
                if trans_words[j] == word.lower():
                    output[i] = (word, "correct")  # Mark as correct
                    break  # Stop once a match is found

    for i, (word, status) in enumerate(output):
        if status == "incorrect" and word in ['.', ',', '!', '?']:
            output[i] = (word, "correct")
            
    return output


"""
if the transcription is "hello world how are you" 
and the user input is "hello word how is you".
output to frontend:

[('hello', 'correct'), ('word', 'incorrect'), ('how', 'correct'), ('is', 'incorrect'), ('you', 'correct')]


"""