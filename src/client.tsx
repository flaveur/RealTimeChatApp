import { initClient, initClientNavigation } from "rwsdk/client";

initClient();
// !  TODO: Bug => if used then Location header is not resolved
//initClientNavigation({ scrollBehavior: "smooth" });
