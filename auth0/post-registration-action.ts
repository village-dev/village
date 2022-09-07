/**
 * This code lives inside of Auth0. I haven't tried to setup CD so update here:
 * https://manage.auth0.com/dashboard/us/dev-o5w8qh9w/actions/library/details/f7f28b74-72c8-4e23-a065-66f80f5b830a
 * as needed
 *
 * See top-level readme for info on how to run/test this code
 */

const axios = require("axios");
const PROXY_ADDRESS = "https://1696-71-202-3-51.ngrok.io";

/**
 * Handler that will be called during the execution of a PostUserRegistration flow.
 *
 * @param {Event} event - Details about the context and user that has registered.
 */
exports.onExecutePostUserRegistration = async (event) => {
  console.log(event.user.user_id);
  try {
    axios.post(`${PROXY_ADDRESS}/users/create`, "", {
      params: {
        user_id: event.user.user_id,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
