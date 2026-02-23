import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

import { LoginSchema } from "@/schemas";
import { authUsingApi } from "@/dal/user";

export const runtime = "nodejs";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

export class CustomCredSignin extends CredentialsSignin {
  code = `c_autherror`;
  constructor(message?: string | Error) {
    super(typeof message === "string" ? message : message?.message);
    if (typeof message === "string") {
      this.message = message;
    } else if (message instanceof Error) {
      this.message = message.message;
    }
  }
}

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password, role } = validatedFields.data;

          const user = await authUsingApi({ email, password, role });

          if (user) {
            if (user.apiErrMsg && typeof user.apiErrMsg === "string") {
              throw new CustomCredSignin(`${user.apiErrMsg}`); // auth flow is broken & end-user will see the message
            }

            // Fetch permitted routes for EMPLOYEE users
            let permittedRoutes: string[] = [];

            if (
              user.userType?.toUpperCase() === "EMPLOYEE" &&
              user.accessToken
            ) {
              try {
                const permissionUrl = `${backendUrl}/permissions/my-routes`;

                const permissionsResponse = await axios.get(permissionUrl, {
                  headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                  },
                });

                permittedRoutes = permissionsResponse.data?.data?.routes || [];
              } catch (error: any) {
                // Continue without permissions - user can still login
              }
            }

            return {
              id: user._id || user.uuid,
              uuid: user.uuid || user._id, // Always set uuid, fallback to _id
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone ? user.phone : null, // ternary op. to explicitly check falsy values instead of using || .
              email_verified: user.emailVerifiedAt ? true : false,
              role: user.userType ? user.userType.toUpperCase() : null,
              reward_points: user.rewardPoints ?? null,
              newsletter_opt_in: user.newsletterOptIn ?? null,
              addresses: null, // Backend doesn't include addresses in auth response
              accessToken: user.accessToken,
              permittedRoutes: permittedRoutes, // Add permitted routes
            };
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
