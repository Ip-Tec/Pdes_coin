import secrets

def generate_key(key_length=24):
    # Generate a 24-byte key (48 characters in hex)
    key = secrets.token_hex(key_length)
    return key

# Generate a random referral code    
def generate_referral_code(key_length=6):
    characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return ''.join(secrets.choice(characters) for _ in range(key_length))


if __name__ == "__main__":
    key = generate_key()
    print(key)