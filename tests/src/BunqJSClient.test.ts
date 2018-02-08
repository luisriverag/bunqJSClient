import * as moxios from "moxios";
import BunqJSClient from "../../src/BunqJSClient";

import CustomDb from "../TestHelpers/CustomDb";
import { randomHex } from "../TestHelpers/RandomData";
import {
    installationRegistration,
    deviceServerRegistration,
    sessionRegistration
} from "../TestHelpers/DefaultResponses";

import {
    default as apiInstallation,
    installToken,
    serverPublicKeyPem
} from "../TestData/api-installation";
import {
    default as apiDeviceServer,
    deviceId
} from "../TestData/api-device-server";
import {
    default as apiSessionRegistration,
    sessionId,
    sessionToken,
    sessionTokenId
} from "../TestData/api-session-registration";

const fakeApiKey = randomHex(64);
const fakeEncryptionKey = randomHex(32);

describe("BunqJSClient", () => {
    beforeEach(function() {
        moxios.install();
    });

    afterEach(function() {
        moxios.uninstall();
    });

    describe("#construct()", () => {
        it("should create a new instance", () => {
            const app = new BunqJSClient(new CustomDb("construct1"));
            expect(app instanceof BunqJSClient).toBeTruthy();
        });

        it("should create a new instance without a custom storage interface", () => {
            const app = new BunqJSClient();
            expect(app instanceof BunqJSClient).toBeTruthy();
        });
    });

    describe("#run()", () => {
        it("run with default options", async () => {
            const app = new BunqJSClient(new CustomDb("run1"));

            await app.run(fakeApiKey);

            expect(app.Session.environment === "SANDBOX");
            expect(app.Session.apiKey === fakeApiKey);
            expect(app.Session.encryptionKey === fakeEncryptionKey);
        });

        it("run with custom options", async () => {
            const app = new BunqJSClient(new CustomDb("run2"));

            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            expect(app.Session.environment === "SANDBOX");
            expect(app.Session.apiKey === fakeApiKey);
            expect(app.Session.encryptionKey === fakeEncryptionKey);
        });
    });

    describe("#install()", async () => {
        it("installationRegistration without stored data", async () => {
            const app = new BunqJSClient(new CustomDb("install"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            const installPromise = app.install();

            await new Promise((resolve, reject) => {
                moxios.wait(() => {
                    moxios.requests
                        .mostRecent()
                        .respondWith(apiInstallation())
                        .then(resolve)
                        .catch(reject);
                });
            });
            await installPromise;

            // re-run, it should be done instantly since the device registration is done already
            await app.install();

            expect(app.Session.installToken === installToken);
            expect(app.Session.serverPublicKeyPem === serverPublicKeyPem);
        });
    });

    describe("#registerDevice()", () => {
        it("device registration without stored data", async () => {
            const app = new BunqJSClient(new CustomDb("device"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            const deviceRegistrationPromise = app.registerDevice();

            await new Promise((resolve, reject) => {
                moxios.wait(() => {
                    moxios.requests
                        .mostRecent()
                        .respondWith(apiDeviceServer(true))
                        .then(resolve)
                        .catch(reject);
                });
            });
            await deviceRegistrationPromise;

            // re-run, it should be done instantly since the installationRegistration is done already
            await app.registerDevice();

            expect(app.Session.deviceId === deviceId);
        });

        it("device registration fails and resets session data", async () => {
            const app = new BunqJSClient(new CustomDb("device"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            const deviceRegistrationPromise = app.registerDevice();

            await new Promise((resolve, reject) => {
                moxios.wait(() => {
                    moxios.requests
                        .mostRecent()
                        .respondWith(apiDeviceServer(true))
                        .then(resolve)
                        .catch(reject);
                });
            });
            await deviceRegistrationPromise;

            expect(app.Session.deviceId === deviceId);
        });
    });

    describe("#registerSession()", () => {
        it("session registration without stored data", async () => {
            const app = new BunqJSClient(new CustomDb("session"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            // installationRegistration
            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            // device registration
            const devicePromise = app.registerDevice();
            const deviceHandler = deviceServerRegistration(moxios);
            await devicePromise;
            await deviceHandler;

            const sessionRegistrationPromise = app.registerSession();

            await new Promise((resolve, reject) => {
                moxios.wait(() => {
                    moxios.requests
                        .mostRecent()
                        .respondWith(apiSessionRegistration(true))
                        .then(resolve)
                        .catch(reject);
                });
            });
            await sessionRegistrationPromise;

            // re-run, it should be done instantly since the installationRegistration is done already
            await app.registerSession();

            expect(app.Session.sessionId === sessionId);
            expect(app.Session.sessionToken === sessionToken);
            expect(app.Session.sessionTokenId === sessionTokenId);
            expect(app.Session.userInfo === deviceId);
        });
    });

    describe("#destroySession()", () => {
        it("create a session and remove it", async () => {
            const app = new BunqJSClient(new CustomDb("destroySession"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            // installationRegistration
            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            // device registration
            const devicePromise = app.registerDevice();
            const deviceHandler = deviceServerRegistration(moxios);
            await devicePromise;
            await deviceHandler;

            // session registration
            const sessionPromise = app.registerSession();
            const sessionHandler = sessionRegistration(moxios);
            await sessionPromise;
            await sessionHandler;

            // first check if the values are currently set
            expect(app.Session.sessionId === sessionId);
            expect(app.Session.sessionToken === sessionToken);
            expect(app.Session.sessionTokenId === sessionTokenId);
            expect(app.Session.userInfo === deviceId);

            const destroySessionPromise = app.destroySession();
            await new Promise((resolve, reject) => {
                moxios.wait(() => {
                    moxios.requests
                        .mostRecent()
                        .respondWith({
                            status: 200,
                            response: true
                        })
                        .then(resolve)
                        .catch(reject);
                });
            });
            await destroySessionPromise;

            // the values should be unset now
            expect(app.Session.sessionId === null);
            expect(app.Session.sessionToken === null);
            expect(app.Session.sessionTokenId === null);
            expect(app.Session.userInfo === {});
        });
    });

    describe("#getUser()", () => {
        it("should return UserCompany object", async () => {
            const app = new BunqJSClient(new CustomDb("getUser1"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            // installationRegistration
            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            // device registration
            const devicePromise = app.registerDevice();
            const deviceHandler = deviceServerRegistration(moxios);
            await devicePromise;
            await deviceHandler;

            // session registration
            const sessionPromise = app.registerSession();
            const sessionHandler = sessionRegistration(moxios);
            await sessionPromise;
            await sessionHandler;

            const userInfo = await app.getUser("UserCompany", false);

            expect(userInfo.id === 42);
            expect(userInfo.name === "bunq");
        });

        it("should return undefined", async () => {
            const app = new BunqJSClient(new CustomDb("getUser2"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            // installationRegistration
            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            // device registration
            const devicePromise = app.registerDevice();
            const deviceHandler = deviceServerRegistration(moxios);
            await devicePromise;
            await deviceHandler;

            // session registration
            const sessionPromise = app.registerSession();
            const sessionHandler = sessionRegistration(moxios);
            await sessionPromise;
            await sessionHandler;

            const userInfo = await app.getUser("InvalidType", false);

            expect(userInfo === undefined);
        });
    });

    describe("#getUsers()", () => {
        it("should return a list with one UserCompany object", async () => {
            const app = new BunqJSClient(new CustomDb("getUsers"));
            await app.run(fakeApiKey, [], "SANDBOX", fakeEncryptionKey);

            // installationRegistration
            const installationPromise = app.install();
            const installationHandler = installationRegistration(moxios);
            await installationPromise;
            await installationHandler;

            // device registration
            const devicePromise = app.registerDevice();
            const deviceHandler = deviceServerRegistration(moxios);
            await devicePromise;
            await deviceHandler;

            // session registration
            const sessionPromise = app.registerSession();
            const sessionHandler = sessionRegistration(moxios);
            await sessionPromise;
            await sessionHandler;

            const users = await app.getUsers(false);
            expect(users.length >= 1);

            const userInfo = users.UserCompany;
            expect(userInfo.id === 42);
            expect(userInfo.name === "bunq");
        });
    });
});
