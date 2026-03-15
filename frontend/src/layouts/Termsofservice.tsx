export default function TermsOfService() {
  return (
    <div className=" min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: March 2026 · ActivityHub</p>
        </div>

        <div className="flex flex-col gap-10 text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using ActivityHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. ActivityHub is a platform that allows users to create, discover, and join local activities and events in their community.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Account Registration</h2>
            <p className="mb-3">To use ActivityHub, you must:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Be at least 13 years of age.</li>
              <li>Provide accurate and truthful information during registration.</li>
              <li>Keep your account credentials secure and not share them with others.</li>
              <li>Have only one account per person.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Conduct</h2>
            <p className="mb-3">When using ActivityHub, you agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Post false, misleading, or fraudulent activities or events.</li>
              <li>Harass, abuse, or harm other users in any way.</li>
              <li>Upload offensive, inappropriate, or illegal content.</li>
              <li>Use the platform for spam, advertising, or commercial purposes without authorization.</li>
              <li>Attempt to access other users' accounts or private data.</li>
              <li>Interfere with or disrupt the platform's infrastructure or services.</li>
              <li>Impersonate another person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Activities & Events</h2>
            <p className="mb-3">When creating activities on ActivityHub:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>You are responsible for the accuracy of the activity details including date, time, location, and description.</li>
              <li>You must ensure activities comply with applicable local laws and regulations in Morocco.</li>
              <li>You may not create activities that promote illegal behavior, violence, or discrimination.</li>
              <li>ActivityHub is not responsible for what happens during activities organized through the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Content Ownership</h2>
            <p>
              You retain ownership of the content you post on ActivityHub, including your profile information and activity descriptions. By posting content, you grant ActivityHub a non-exclusive license to display and distribute that content within the platform for the purpose of providing the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Profile Images</h2>
            <p>
              By uploading a profile image, you confirm that you have the right to use that image and that it does not violate any third-party rights. ActivityHub reserves the right to remove any profile image that is deemed inappropriate or offensive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Account Termination</h2>
            <p className="mb-3">ActivityHub reserves the right to suspend or terminate your account if you:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Violate any of these Terms of Service.</li>
              <li>Engage in behavior that is harmful to other users or the platform.</li>
              <li>Provide false information during registration.</li>
              <li>Attempt to abuse or exploit the platform's features.</li>
            </ul>
            <p className="mt-3">You may also delete your own account at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              ActivityHub is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to damages resulting from activities you participate in, interactions with other users, or any technical issues with the service. Participation in any activity organized through ActivityHub is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Third-Party Services</h2>
            <p>
              ActivityHub integrates with Google OAuth for authentication. Your use of Google login is subject to Google's own Terms of Service and Privacy Policy. ActivityHub is not responsible for the practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated date. Continued use of ActivityHub after changes are posted means you accept the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Governing Law</h2>
            <p>
              These Terms of Service are governed by the laws of Morocco. Any disputes arising from the use of ActivityHub will be subject to the jurisdiction of Moroccan courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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