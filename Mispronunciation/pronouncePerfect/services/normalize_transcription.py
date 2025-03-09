import re
import difflib
from indicnlp.tokenize import indic_tokenize
from indicnlp.normalize import indic_normalize

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
    
    def normalize_text(self, text):
        """Apply comprehensive normalization to Nepali text"""
        # Apply standard Indic normalization
        text = self.normalizer.normalize(text)
        
        # Replace Latin digits with Devanagari
        digit_map = {'0': '०', '1': '१', '2': '२', '3': '३', '4': '४', 
                     '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'}
        for latin, devanagari in digit_map.items():
            text = text.replace(latin, devanagari)
            
        # Standardize spacing around punctuation
        text = re.sub(r'\s*([।॥,.?!])\s*', r'\1 ', text)
        
        # Normalize repeated characters (like हहहा -> हा)
        text = re.sub(r'(.)\1+', r'\1', text)
        
        return text.strip()
    
    def tokenize(self, text):
        """Enhanced tokenization for Nepali"""
        # First normalize the text
        normalized = self.normalize_text(text)
        
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
        """Check if two words are considered equivalent in Nepali"""
        if word1.lower() == word2.lower():
            return True
            
        # Check if words are in the same equivalence class
        if word1 in self.equivalence_map and word2 in self.equivalence_map[word1]:
            return True
            
        # Check for schwa deletion variation (simplified)
        w1_no_schwa = re.sub(r'([क-ह])([क-ह])', r'\1्\2', word1)
        if w1_no_schwa == word2 or word1 == re.sub(r'([क-ह])([क-ह])', r'\1्\2', word2):
            return True
            
        return False
    
    def compare_texts(self, transcription, user_input):
        """
        Compare model transcription with user input, accounting for
        Nepali-specific linguistic variations
        """
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
                    output[i] = (word, "correct")
                    break
        
        return output

# Example usage:
# comparer = NepaliTextComparer()
# result = comparer.compare_texts("आज मौसम राम्रो छ।", "आज मौसम रामरो छ")