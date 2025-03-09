import difflib
import re

import re
import difflib
from indicnlp.tokenize import indic_tokenize

def tokenize(text, language="en"):
    """
    Tokenize text based on language.
    
    Args:
        text (str): Text to tokenize
        language (str): Language code ('en' for English, 'ne' for Nepali)
    
    Returns:
        list: List of tokens
    """
    if language == "en":
        # English tokenization: extract words and punctuation while preserving spaces
        return re.findall(r"\w+|[^\w\s]", text)
    elif language == "np":
        # Nepali tokenization using indic_tokenize
        return list(indic_tokenize.trivial_tokenize(text, lang="ne"))
    else:
        raise ValueError(f"Unsupported language: {language}")

def compare_texts(transcription, user_input, language="en"):
    """
    Compare transcription with user input and mark words as correct or incorrect.
    
    Args:
        transcription (str): Reference text
        user_input (str): Text to compare against reference
        language (str): Language code ('en' for English, 'ne' for Nepali)
    
    Returns:
        list: List of tuples (word, status) where status is 'correct' or 'incorrect'
    """
    # Tokenize both texts
    trans_words = tokenize(transcription.lower(), language)
    input_words = tokenize(user_input.lower(), language)
    original_input_words = tokenize(user_input, language)
    
    # Use sequence matcher to find differences
    matcher = difflib.SequenceMatcher(None, input_words, trans_words)
    
    output = []
    
    # Process the opcodes (edit operations)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for k in range(i1, i2):
                output.append((original_input_words[k], "correct"))
        elif tag in ["replace", "delete"]:
            for k in range(i1, i2):
                output.append((original_input_words[k], "incorrect"))
        elif tag == "insert":
            pass  # Ignore extra words in transcription
    
    # Handle correct words with ±2 position check
    for i, (word, status) in enumerate(output):
        if status == "incorrect":  # Only check incorrect words
            for j in range(max(0, i - 2), min(len(trans_words), i + 3)):  # Look within ±2 words
                if trans_words[j] == word.lower():
                    output[i] = (word, "correct")  # Mark as correct
                    break  # Stop once a match is found
    
    # Language-specific post-processing
    if language == "en":
        # Mark common punctuation as correct
        punctuation = ['.', ',', '!', '?']
        for i, (word, status) in enumerate(output):
            if status == "incorrect" and word in punctuation:
                output[i] = (word, "correct")
    
    # For Nepali, we could add specific punctuation or other language-specific rules here
    elif language == "np":
        # Nepali-specific punctuation (including Devanagari punctuation)
        nepali_punctuation = ['.', ',', '!', '?', '।', '॥', '?', '!']
        for i, (word, status) in enumerate(output):
            if status == "incorrect" and word in nepali_punctuation:
                output[i] = (word, "correct")
    
    return output
"""
# Example usage:

English comparison
    result_en = compare_texts("This is a sample text.", "This is a smple text.", "en")
Nepali comparison
    result_ne = compare_texts("यो एउटा उदाहरण पाठ हो।", "यो एउट उदाहरण पठ हो।", "ne")

if the transcription is "hello world how are you" 
and the user input is "hello word how is you".
output to frontend:

[('hello', 'correct'), ('word', 'incorrect'), ('how', 'correct'), ('is', 'incorrect'), ('you', 'correct')]


"""