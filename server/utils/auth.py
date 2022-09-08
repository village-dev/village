import os
from typing import Any, List, TypedDict, cast

import jwt


def set_up():
    """Sets up configuration for the app"""

    config = {
        "DOMAIN": os.getenv("AUTH0_DOMAIN_REAL", "your.domain.com"),
        "API_AUDIENCE": os.getenv("AUTH0_AUDIENCE", "your.audience.com"),
        "ISSUER": os.getenv("AUTH0_DOMAIN", "https://your.domain.com/"),
        "ALGORITHMS": os.getenv("ALGORITHMS", "RS256"),
    }
    return config


ParsedToken = TypedDict(
    "ParsedToken",
    {
        "iss": str,
        "sub": str,
        "aud": List[str],
        "iat": int,
        "exp": int,
        "azp": str,
        "scope": str,
    },
)


class VerifyToken:
    """Does all the token verification using PyJWT"""

    def __init__(self, token: str):
        self.token = token
        self.config = set_up()

        # This gets the JWKS from a given URL and does processing so you can
        # use any of the keys available
        jwks_url = f'https://{self.config["DOMAIN"]}/.well-known/jwks.json'
        self.jwks_client = jwt.PyJWKClient(jwks_url)

    def verify(self) -> ParsedToken:
        # This gets the 'kid' from the passed token
        self.signing_key: str = cast(
            Any, self.jwks_client.get_signing_key_from_jwt(self.token)
        ).key

        payload: ParsedToken = jwt.decode(  # type: ignore
            self.token,
            self.signing_key,
            algorithms=[self.config["ALGORITHMS"]],
            audience=self.config["API_AUDIENCE"],
            issuer=self.config["ISSUER"],
        )

        return payload
