import {authenticated} from "../auth-helpers";

export default {
    me: authenticated((root, args, context) => context.currentUser),
    serverTime: () => new Date(),
};