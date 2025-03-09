import re
from typing import Set, List

def segment_nepali_text(text: str, common_words: Set[str], min_word_length: int = 2) -> List[str]:
    """
    Segment a Nepali text string into meaningful words using a dictionary-based approach.
    
    Args:
        text (str): Input text to segment (e.g., "मौसमपानीपरेकोछ").
        common_words (Set[str]): Set of known Nepali words for matching.
        min_word_length (int): Minimum length for a word to be considered valid (default: 2).
    
    Returns:
        List[str]: List of segmented words.
    """
    # Remove any existing spaces for consistency
    text = text.replace(" ", "")
    if not text:
        return []

    # Initialize result list and tracking variables
    words = []
    current = text
    position = 0

    # Define character classes for smarter fallback
    consonants = set('कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')
    vowel_signs = set('ािीुूृेैोौ')
    halant = '्'

    while current:
        matched = False
        # Try longest match first from common_words
        for word in sorted(common_words, key=len, reverse=True):
            if current.startswith(word):
                words.append(word)
                current = current[len(word):]
                position += len(word)
                matched = True
                break
        
        if not matched:
            # Fallback: Look ahead to find a plausible boundary
            if len(current) <= min_word_length:
                # If remaining text is too short, append it as is
                words.append(current)
                break
            
            # Attempt to find a boundary based on linguistic rules
            for i in range(1, min(len(current), max(map(len, common_words)) + 1)):
                candidate = current[:i]
                remaining = current[i:]
                
                # Check if candidate ends with a consonant and remaining starts logically
                if (candidate[-1] in consonants and 
                    (not remaining or remaining[0] in consonants or remaining[0] in vowel_signs)):
                    # Potential word boundary (e.g., consonant-consonant or consonant-vowel)
                    words.append(candidate)
                    current = remaining
                    position += i
                    matched = True
                    break
                
                # Check if candidate is a standalone word
                if candidate in common_words:
                    words.append(candidate)
                    current = remaining
                    position += i
                    matched = True
                    break
            
            if not matched:
                # Last resort: Take one character and move forward
                words.append(current[0])
                current = current[1:]
                position += 1

    # Post-process: Merge small fragments with previous words if invalid
    final_words = []
    i = 0
    while i < len(words):
        if (len(words[i]) < min_word_length and 
            i > 0 and 
            words[i] not in common_words and 
            all(c in vowel_signs or c == halant for c in words[i])):
            # Merge short vowel/halant fragments with previous word
            final_words[-1] += words[i]
        else:
            final_words.append(words[i])
        i += 1

    return final_words

# Expanded common words list (add more as needed)
nepali_words = {
    "मौसम", "पानी", "परेको", "छ", "सम", "हो", "गर्छ", "तिमी",
    "हुन्छ", "गर्न", "के", "यो", "त्यो", "हामी", "उनी", "भयो",
    "सक्छ", "थियो", "र", "मा", "को", "ले", "बाट", "संग"
}

# Test cases
test_cases = [
    "मौसमपानीपरेकोछ",      # "मौसम पानी परेको छ"
    "मौसम्पानीपरेकोछ",     # Variant with extra 'म्'
    "हामीगर्छौं",           # "हामी गर्छौं"
    "तिमीकेहो",             # "तिमी के हो"
    "मौ सम्पानीपरेको छ"     # Your original example
]

for transcription in test_cases:
    segmented = segment_nepali_text(transcription.replace(" ", ""), nepali_words)
    print(f"Input: {transcription} → Segmented: {segmented}")