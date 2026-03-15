export default function PrivacyPolicy() {
  return (
    <div className=" min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: March 2026 Â· ActivityHub</p>
        </div>

        <div className="flex flex-col gap-10 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to ActivityHub. We are committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information when you use our platform to create and join local activities and events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information when you register or use ActivityHub:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li><span className="text-white font-semibold">Account Information:</span> Your first name, last name, username, and email address.</li>
              <li><span className="text-white font-semibold">Profile Image:</span> A profile picture you upload voluntarily.</li>
              <li><span className="text-white font-semibold">Google Login Data:</span> If you sign in via Google, we receive your name, email, and Google ID from Google OAuth.</li>
              <li><span className="text-white font-semibold">Activity Data:</span> Activities you create, join, or save on the platform.</li>
              <li><span className="text-white font-semibold">Social Data:</span> Users you follow (keep up with) and users who follow you.</li>
              <li><span className="text-white font-semibold">Usage Data:</span> Online status and interactions within the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use your data solely to provide and improve the ActivityHub service:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>To create and manage your account.</li>
              <li>To display your profile to other users on the platform.</li>
              <li>To enable you to create, join, and discover local activities.</li>
              <li>To facilitate communication between activity participants.</li>
              <li>To show your online status to other users.</li>
              <li>To improve the performance and features of the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Your data is only shared in the following limited cases:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 mt-3">
              <li>With other ActivityHub users as part of normal platform functionality (e.g., your name and profile image are visible to other users).</li>
              <li>With Google, solely for authentication purposes when you choose to sign in with Google.</li>
              <li>When required by law or legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Storage & Security</h2>
            <p>
              Your data is stored securely on our servers. Profile images are stored as files on the server. Passwords are hashed using bcrypt and never stored in plain text. Authentication is handled via secure JWT tokens and HTTP-only cookies. We take reasonable measures to protect your data from unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">As a user of ActivityHub, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Access and view your personal data through your profile page.</li>
              <li>Update or correct your information at any time via the Edit Profile feature.</li>
              <li>Delete your account and associated data by contacting us.</li>
              <li>Withdraw consent for Google login at any time through your Google account settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies & Authentication</h2>
            <p>
              ActivityHub uses cookies to maintain your login session. These are essential cookies required for the platform to function. We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Children's Privacy</h2>
            <p>
              ActivityHub is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of ActivityHub after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or your data, please contact us at:
            </p>
            <div className="mt-3 bg-[#1E1E1E] border border-zinc-800 rounded-xl p-4 text-zinc-400">
              <p><span className="text-white font-semibold">ActivityHub</span></p>
              <p>Email: support@activityhub.ma</p>
              <p>Morocco</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}