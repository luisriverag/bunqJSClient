import * as moxios from "moxios";

import BunqJSClient from "../../../src/BunqJSClient";

import Prepare from "../../TestHelpers/Prepare";
import SetupApp from "../../TestHelpers/SetupApp";
import { defaultResponse } from "../../TestHelpers/DefaultResponses";

let bunqApp: BunqJSClient;

describe("API", () => {
    beforeAll(async done => {
        moxios.install();

        // prepare certificates
        await Prepare();
        // create a bunqjsclient to be used in the tests
        bunqApp = await SetupApp("ShareInviteBankInquiry");

        moxios.uninstall();
        done();
    });

    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());

    describe("ShareInviteBankInquiry", () => {
        it("#GET", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.get(1, 2, 3);
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#LIST", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.list(1, 2, {});
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#LIST - defaults", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.list(1, 2);
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#LIST - with pagination options", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.list(1, 2, {
                newer_id: 1,
                older_id: 2,
                count: 200
            });
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#POST", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.post(
                1,
                2,
                {
                    type: "EMAIL",
                    value: "mail@mail.com"
                },
                {
                    ShareDetailPayment: {
                        make_payments: true,
                        make_draft_payments: true,
                        view_balance: true,
                        view_old_events: true,
                        view_new_events: true
                    }
                },
                "PENDING",
                {}
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#POST - defaults", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.post(
                1,
                2,
                {
                    type: "EMAIL",
                    value: "mail@mail.com"
                },
                {
                    ShareDetailPayment: {
                        make_payments: true,
                        make_draft_payments: true,
                        view_balance: true,
                        view_old_events: true,
                        view_new_events: true
                    }
                }
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#POST - specific options", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.post(
                1,
                2,
                {
                    type: "EMAIL",
                    value: "mail@mail.com"
                },
                {
                    ShareDetailPayment: {
                        make_payments: true,
                        make_draft_payments: true,
                        view_balance: true,
                        view_old_events: true,
                        view_new_events: true
                    }
                },
                "REVOKED",
                {
                    share_type: "STANDARD",
                    start_date: new Date(),
                    end_date: new Date()
                }
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#PUT", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.put(
                1,
                2,
                3,
                {
                    type: "EMAIL",
                    value: "mail@mail.com"
                },
                {
                    ShareDetailPayment: {
                        make_payments: true,
                        make_draft_payments: true,
                        view_balance: true,
                        view_old_events: true,
                        view_new_events: true
                    }
                },
                "REVOKED",
                {
                    share_type: "STANDARD",
                    start_date: new Date(),
                    end_date: new Date()
                }
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#PUT - defaults", async () => {
            const request = bunqApp.api.shareInviteBankInquiry.put(
                1,
                2,
                3,
                {
                    type: "EMAIL",
                    value: "mail@mail.com"
                },
                {
                    ShareDetailPayment: {
                        make_payments: true,
                        make_draft_payments: true,
                        view_balance: true,
                        view_old_events: true,
                        view_new_events: true
                    }
                }
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#PUT - putStatus", async () => {
            // create a bunqjsclient to be used in the tests
            bunqApp = await SetupApp("ApiGeneral-shareInviteBankInquiry");

            const request = bunqApp.api.shareInviteBankInquiry.putStatus(1, 2, 3, "PENDING");
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });
    });
});