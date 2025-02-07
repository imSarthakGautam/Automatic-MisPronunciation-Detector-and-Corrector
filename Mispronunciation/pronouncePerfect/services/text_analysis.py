import difflib

def compare_texts(transcribed_text, user_text):
    """
    Compares the transcribed text with user-provided text and returns:
    - Similarity score
    - Word differences
    """
    matcher = difflib.SequenceMatcher(None, transcribed_text, user_text)
    similarity = matcher.ratio()  # 0 to 1 scale

    differences = list(difflib.ndiff(transcribed_text.split(), user_text.split()))
    errors = [word for word in differences if word.startswith("- ") or word.startswith("+ ")]

    return {
        "similarity_score": round(similarity * 100, 2),  # Convert to percentage
        "differences": errors
    }
