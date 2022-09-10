import os

from fastapi import APIRouter, Depends, HTTPException
from slack_sdk.oauth import AuthorizeUrlGenerator
from slack_sdk.oauth.installation_store import FileInstallationStore, Installation
from slack_sdk.oauth.state_store import FileOAuthStateStore
from slack_sdk.web import WebClient

from config import SLACK_CLIENT_ID

router = APIRouter(tags=["slack"])

# Issue and consume state parameter value on the server-side.
state_store = FileOAuthStateStore(expiration_seconds=300, base_dir="./data")
# Persist installation data and lookup it by IDs.
installation_store = FileInstallationStore(base_dir="./data")

# Build https://slack.com/oauth/v2/authorize with sufficient query parameters
authorize_url_generator = AuthorizeUrlGenerator(
    client_id=SLACK_CLIENT_ID,
    scopes=["app_mentions:read", "chat:write"],
    user_scopes=["search:read"],
)


@router.get("/slack/oauth/callback")
def oauth_callback(code, state):
    # Retrieve the auth code and state from the request params
    if code is None or state is None:
        return "Try the installation again (error)"
    else:
        # Verify the state parameter
        if state_store.consume(request.args["state"]):
            client = WebClient()  # no prepared token needed for this
            # Complete the installation by calling oauth.v2.access API method
            oauth_response = client.oauth_v2_access(
                client_id=client_id,
                client_secret=client_secret,
                redirect_uri=redirect_uri,
                code=request.args["code"],
            )

            installed_enterprise = oauth_response.get("enterprise", {})
            is_enterprise_install = oauth_response.get("is_enterprise_install")
            installed_team = oauth_response.get("team", {})
            installer = oauth_response.get("authed_user", {})
            incoming_webhook = oauth_response.get("incoming_webhook", {})

            bot_token = oauth_response.get("access_token")
            # NOTE: oauth.v2.access doesn't include bot_id in response
            bot_id = None
            enterprise_url = None
            if bot_token is not None:
                auth_test = client.auth_test(token=bot_token)
                bot_id = auth_test["bot_id"]
                if is_enterprise_install is True:
                    enterprise_url = auth_test.get("url")

            installation = Installation(
                app_id=oauth_response.get("app_id"),
                enterprise_id=installed_enterprise.get("id"),
                enterprise_name=installed_enterprise.get("name"),
                enterprise_url=enterprise_url,
                team_id=installed_team.get("id"),
                team_name=installed_team.get("name"),
                bot_token=bot_token,
                bot_id=bot_id,
                bot_user_id=oauth_response.get("bot_user_id"),
                bot_scopes=oauth_response.get("scope"),  # comma-separated string
                user_id=installer.get("id"),
                user_token=installer.get("access_token"),
                user_scopes=installer.get("scope"),  # comma-separated string
                incoming_webhook_url=incoming_webhook.get("url"),
                incoming_webhook_channel=incoming_webhook.get("channel"),
                incoming_webhook_channel_id=incoming_webhook.get("channel_id"),
                incoming_webhook_configuration_url=incoming_webhook.get(
                    "configuration_url"
                ),
                is_enterprise_install=is_enterprise_install,
                token_type=oauth_response.get("token_type"),
            )

            # Store the installation
            installation_store.save(installation)

            return "Thanks for installing this app!"
