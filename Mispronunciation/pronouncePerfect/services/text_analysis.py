import difflib
import re

# to keep punctuations intact.
def tokenize(text):
    """Extract words and punctuation together while preserving spaces."""
    return re.findall(r"\w+|[^\w\s]", text)

def compare_texts(transcription, user_input):
    trans_words = tokenize(transcription)
    input_words = tokenize(user_input)
    
    matcher = difflib.SequenceMatcher(None, input_words, trans_words)
    
    output = []
    
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":  # Words are correctly aligned
            for word in input_words[i1:i2]:
                output.append((word, "correct"))
        
        elif tag == "replace":  # Different words
            for word in input_words[i1:i2]:
                output.append((word, "incorrect"))
        
        elif tag == "delete":  # Words missing in transcription
            for word in input_words[i1:i2]:
                output.append((word, "incorrect"))
        
        elif tag == "insert":  # Extra words in transcription
            pass  # Ignore extra words in transcription

    # **Handling Correct Words with ±2 Position Check**
    for i, (word, status) in enumerate(output):
        if status == "incorrect":  # Only check incorrect words
            for j in range(max(0, i - 2), min(len(trans_words), i + 3)):  # Look within ±2 words
                if trans_words[j] == word:
                    output[i] = (word, "correct")  # Mark as correct
                    break  # Stop once a match is found

    return output


"""
if the transcription is "hello world how are you" 
and the user input is "hello word how is you".
output to frontend:

[('hello', 'correct'), ('word', 'incorrect'), ('how', 'correct'), ('is', 'incorrect'), ('you', 'correct')]


"""