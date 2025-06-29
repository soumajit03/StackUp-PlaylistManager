import React from "react";
import { SignIn } from "@clerk/clerk-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <SignIn
          appearance={{
            elements: {
              card: "w-full px-4 py-4",
              formButtonPrimary: "bg-red-600 hover:bg-red-700",
              footerActionLink: "text-red-600 hover:text-red-700",
              socialButtonsBlockButton: "w-full",
              dividerText: "text-gray-400 text-sm",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default AuthPage;
