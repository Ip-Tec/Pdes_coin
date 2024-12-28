import secrets

def generate_key(key_length=24):
    # Generate a 24-byte key (48 characters in hex)
    key = secrets.token_hex(key_length)
    return key

if __name__ == "__main__":
    key = generate_key()
    print(key)