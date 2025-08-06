export default function SessionChecker() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-slate-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Glassmorphism container */}
        <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-3xl p-12 shadow-2xl">
          {/* Animated logo/icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin">
                <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
            </div>
          </div>

          {/* Text content */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Memverifikasi Sesi
            </h2>
            <p className="text-slate-400 text-lg">
              Mohon tunggu sebentar...
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-8 w-64 h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-3">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(100,116,139,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,116,139,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </div>
  );
}