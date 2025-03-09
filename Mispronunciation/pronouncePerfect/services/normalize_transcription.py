import re
import difflib
from indicnlp.tokenize import indic_tokenize
from indicnlp.normalize import indic_normalize
import unicodedata

import re

def generate_schwa_variations(word):
    """
    Generate possible schwa deletion variations for a Devanagari word.
    Handles schwa deletion between consonants algorithmically.
    
    Args: word (str): Input word in Devanagari script
    Returns:  List of variations including original word
    """
    variations = [word]
    consonants = r'[क-ह]'
    vowel_signs = r'[ा-ौ]'
    halant = '्'
    
    if len(word) <= 2 or word.endswith(halant):
        return variations
    
    pattern = f'({consonants})({vowel_signs})?({consonants})'
    matches = list(re.finditer(pattern, word))
    
    for match in matches:
        if not match.group(2):  # No vowel sign
            mid = match.start(3)
            if mid < len(word) - 1:
                variation = word[:mid] + halant + word[mid:]
                if variation not in variations:
                    variations.append(variation)
    
    if len(word) > 2 and word[-1] in 'कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह' and word[-2] not in vowel_signs:
        final_variation = word[:-1] + halant + word[-1]
        if final_variation not in variations:
            variations.append(final_variation)
    
    return variations


def check_honorific_equivalence(word1, word2):
    """Check if two words are honorific equivalents using suffix patterns"""
    # Common honorific suffix replacements
    honorific_suffixes = {
        'छु': ['छौं', 'छौ', 'छ'],
        'छौ': ['छ', 'छन्', 'छौं'],
        'न्छ': ['न्छौ', 'न्छन्', 'न्छु'],
        'नुहोस्': ['', 'नु', 'न'],
        # Add more common patterns
    }
    
    # Check if any suffix replacement would make the words match
    for base_suffix, variants in honorific_suffixes.items():
        if word1.endswith(base_suffix):
            stem = word1[:-len(base_suffix)]
            for variant in variants:
                if word2 == stem + variant:
                    return True
        if word2.endswith(base_suffix):
            stem = word2[:-len(base_suffix)]
            for variant in variants:
                if word1 == stem + variant:
                    return True
    
    return False

# dictionary that maps Devanagari characters to their "phonetic representatives" based on similar sound classes.
# This groups characters that sound similar (e.g., aspirated and unaspirated versions of the same consonant) into a single representative character.
sound_classes = {
    # Similar sounding sibilants
    'श': 'स',
    'ष': 'स',
    'स': 'स', 

     # Voiced labials 
    'व': 'ब',
    'ब': 'ब',   

    # Aspirated vs. non-aspirated
    'क': 'क', 
    'ख': 'क',   
    'ग': 'ग', 
    'घ': 'ग'
}
def get_nepali_phonetic_code(word):
    """Generate a simplified phonetic code for Nepali words"""
    # Replace characters with their phonetic equivalents
    phonetic = ''
    for char in word:
        phonetic += sound_classes.get(char, char)
    return phonetic


def are_potential_homophones(word1, word2):
    """Check if two words could be homophones based on phonetic similarity"""
    return get_nepali_phonetic_code(word1) == get_nepali_phonetic_code(word2)

def normalize_aakar(text):
    # Common patterns where short/long forms are interchanged
    patterns = {
        'छन्': ['छान्'],
        'गर्न': ['गार्न'],
        'भन्': ['भान्'],
        # Add more patterns
    }
    
    # Apply replacements
    for standard, variants in patterns.items():
        for variant in variants:
            text = text.replace(variant, standard)
    
    return text

def normalize_ikar(text):
    # Words commonly mistranscribed with incorrect i/ī length
    replacements = {
        'ठिक': ['ठीक'],
        'दिन': ['दीन'],
        'शिक्षा': ['शीक्षा'],
        # Add more based on common errors
    }
    
    for standard, variants in replacements.items():
        for variant in variants:
            text = text.replace(variant, standard)
    
    return text

def normalize_ukar(text):
    # Words commonly mistranscribed with incorrect u/ū length
    replacements = {
        'पुर्ण': ['पूर्ण'],
        'सुचना': ['सूचना'],
        'शुरु': ['शुरू'],
        # Add more based on common errors
    }
    
    for standard, variants in replacements.items():
        for variant in variants:
            text = text.replace(variant, standard)
    
    return text

def normalize_nasal_marks(text):
    # Standardize nasal marks (अनुस्वार ं vs चन्द्रबिन्दु ँ)
    # Often these are confused in transcription
    
    # Define common patterns
    patterns = {
        'हुँदै': ['हुंदै'],
        'मैं': ['मैँ'],
        'तिमीँ': ['तिमीं'],
        # Add more patterns
    }
    
    for standard, variants in patterns.items():
        for variant in variants:
            text = text.replace(variant, standard)
    
    return text

def normalize_visarga(text):
    # Standardize visarga use (ः)
    # Often incorrectly transcribed or omitted
    
    patterns = {
        'अतः': ['अत'],
        'प्रायः': ['प्राय'],
        'विशेषतः': ['विशेषत'],
        # Add more patterns
    }
    
    for standard, variants in patterns.items():
        for variant in variants:
            text = text.replace(variant, standard)
    
    return text

def normalize_consonant_confusions(text):
    """
    Normalize common consonant confusions in Nepali text with context-aware rules.
    
    Args:    text (str): Input text in Devanagari script
    Returns: str: Normalized text
    """
    # Define replacement rules with context
    rules = [
        # Rule 1: 'व' → 'ब' when followed by a vowel sign
        (r'व([ा-ौ])', r'ब\1'),
        # Rule 2: 'ष' or 'स' → 'श' at word start or between consonants
        (r'(\b|[क-ह])स([क-ह]|\b)', r'\1श\2'),
        (r'(\b|[क-ह])ष([क-ह]|\b)', r'\1श\2'),
        # Rule 3: 'क्ष' → 'छ्य' in isolation
        (r'\bक्ष\b', r'छ्य'),
        # Rule 4: 'ज्ञ' → 'ग्य' in isolation
        (r'\bज्ञ\b', r'ग्य'),
    ]
    
    # Additional simple replacements (no context needed)
    simple_replacements = {
        'व': 'ब',  # Fallback if not caught by vowel rule
    }
    # Apply context-aware rules
    for pattern, replacement in rules:
        text = re.sub(pattern, replacement, text)
    # Apply simple replacements (optional, could be context-limited)
    for variant, standard in simple_replacements.items():
        text = re.sub(r'\b' + variant + r'\b', standard, text)
    return text

def normalize_nepali_text(text):
        """Comprehensive Nepali text normalization"""
        # Apply Unicode normalization first
        text = unicodedata.normalize('NFC', text)
        
        # Apply digit normalization
        digit_map = {'0': '०', '1': '१', '2': '२', '3': '३', '4': '४', 
                    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'}
        for latin, devanagari in digit_map.items():
            text = text.replace(latin, devanagari)
        
        # Apply punctuation normalization
        text = text.replace('!', '।').replace('?', '?')
        
        # Standardize spacing
        text = re.sub(r'\s+', ' ', text)
        
        # Apply vowel-specific normalizations
        text = normalize_aakar(text)
        text = normalize_ikar(text)
        text = normalize_ukar(text)
        
        # Apply other normalizations
        text = normalize_nasal_marks(text)
        text = normalize_visarga(text)
        
        # Apply context-dependent consonant normalizations
        text = normalize_consonant_confusions(text)
        
        return text.strip()
class NepaliTextComparer:
    def __init__(self):
        # Initialize normalizer for Nepali
        self.normalizer = indic_normalize.IndicNormalizerFactory().get_normalizer("ne")
        
        # Common pronunciation variations (schwa deletion patterns)
        self.schwa_variations = {
            # Examples of common schwa deletion patterns
            'कमल': ['कमल', 'कम्ल'],
            'पहिलो': ['पहिलो', 'पहिल्'],
            # Add more common variations as needed
        }
        
        # Common homophones
        self.homophones = {
            'छ': ['छ', 'च'],
            'बाट': ['बाट', 'बात'],
            # Add more homophones
        }
        
        # Common honorific equivalents
        self.honorific_equivalents = {
            'हुन्छ': ['हुन्छ', 'हुन्छन्', 'हुन्छौ'],
            'गर्छु': ['गर्छु', 'गर्छौं', 'गर्छौ'],
            # Add more honorific variations
        }
        
        # Build a reverse lookup for all variations
        self.equivalence_map = {}
        for base, variants in [*self.schwa_variations.items(), 
                               *self.homophones.items(), 
                               *self.honorific_equivalents.items()]:
            for variant in variants:
                self.equivalence_map[variant] = variants
    
    
    def tokenize(self, text):
        """Enhanced tokenization for Nepali"""
        # First normalize the text
        normalized = normalize_nepali_text(text)
        
        # Then use indic_tokenize
        tokens = list(indic_tokenize.trivial_tokenize(normalized, lang="ne"))
        
        # Refine the tokens
        refined_tokens = []
        for token in tokens:
            # Handle punctuation
            if re.match(r'^[।॥,.?!]+$', token) and len(token) > 1:
                for char in token:
                    refined_tokens.append(char)
            else:
                refined_tokens.append(token)
        
        return refined_tokens
    
    def are_equivalent(self, word1, word2):
        """Check if two words are equivalent using systematic approaches"""
        if word1.lower() == word2.lower():
            return True
            
        # Check for schwa deletion variations
        if word2 in generate_schwa_variations(word1) or word1 in generate_schwa_variations(word2):
            return True
            
        # Check for honorific equivalents
        if check_honorific_equivalence(word1, word2):
            return True
            
        # Check for potential homophones
        if are_potential_homophones(word1, word2):
            return True
            
        return False
    
    def compare_texts(self, transcription, user_input):
        """
        Compare model transcription with user input, accounting for
        Nepali-specific linguistic variations
        """
        print("Comparing:", transcription, user_input)
        # Tokenize
        trans_tokens = self.tokenize(transcription.lower())
        input_tokens = self.tokenize(user_input.lower())
        original_input_tokens = self.tokenize(user_input)  # Keep original case
        
        # Initial comparison using SequenceMatcher
        matcher = difflib.SequenceMatcher(None, input_tokens, trans_tokens)
        
        output = []
        
        # Process opcodes
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                for k in range(i1, i2):
                    output.append((original_input_tokens[k], "correct"))
            elif tag in ["replace", "delete"]:
                for k in range(i1, i2):
                    output.append((original_input_tokens[k], "incorrect"))
            elif tag == "insert":
                pass  # Ignore extra words in transcription
        
        # Enhanced checking with linguistic knowledge
        for i, (word, status) in enumerate(output):
            # Skip already correct words
            if status == "correct":
                continue
                
            # Check punctuation
            if word in "।॥,.?!":
                output[i] = (word, "correct")
                continue
                
            # Check for word equivalence within ±2 positions
            search_range = min(3, len(trans_tokens))
            position_range = range(max(0, i - search_range), 
                                min(len(trans_tokens), i + search_range + 1))
            
            for j in position_range:
                if j < len(trans_tokens) and self.are_equivalent(word.lower(), trans_tokens[j]):
                    print('equivalent',output[i],"--", word.lower(), "--", trans_tokens[j])
                    output[i] = (word, "correct")
                    break
        
        return output

# Example usage:
# comparer = NepaliTextComparer()
# result = comparer.compare_texts("आज मौसम राम्रो छ।", "आज मौसम रामरो छ")