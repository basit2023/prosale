import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import { metaObject } from '@/config/site.config';
import SignInForm from './sign-in-form';

export const metadata = {
  ...metaObject('Sign In'),
};

function SalesPreview() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-white/70 bg-white p-5 text-left shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Today</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">Sales focus board</h3>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Assigned', '42', 'text-blue-600'],
          ['Unread', '08', 'text-red-600'],
          ['Follow-ups', '76%', 'text-amber-600'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {[
          ['High intent lead', 'Call back in 20 minutes', 'bg-red-50 text-red-600'],
          ['Site visit follow-up', 'Confirm attendance today', 'bg-amber-50 text-amber-600'],
          ['Manager review', 'Team lead queue updated', 'bg-blue-50 text-blue-600'],
        ].map(([title, text, tone]) => (
          <div key={title} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{text}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>Next</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <AuthWrapperOne
      title={
        <>
          Welcome back to <span className="text-[#c54e57]">ProSale</span>
        </>
      }
      description="Sign in to manage leads, follow-ups, calls, and revenue targets from one focused sales workspace."
      bannerTitle="Your sales team gets to the next best action faster."
      bannerDescription="Unread leads, follow-ups, priority queues, and revenue targets are surfaced up front so every user can move quickly."
      isSocialLoginActive={false}
      pageImage={<SalesPreview />}
    >
      <SignInForm />
    </AuthWrapperOne>
  );
}
