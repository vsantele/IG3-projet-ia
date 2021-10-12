import re


def is_email_valid(email):
    """Check if an email is valid.

    Args:
        email (string): input Email.

    Returns:
        bool: `True` if the email is valid, `False` otherwise.
    """
    email.strip()
    return (
        re.match("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email) is not None
    )
