import { Mountain, TrendingUp, Globe } from "lucide-react";

const Header = () => {
  return (
    <div className=" bg-blue-100 pb-5 pt-3.5 text-center ">
      {/* Logo Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Mountain className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
        Terrain Investment Analysis
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Advanced geospatial analysis for smart investment decisions. Get
        comprehensive terrain insights including elevation, slope, rainfall
        patterns, and actionable recommendations.
      </p>

      {/* Features */}
      <div className="flex justify-center items-center space-x-6 mt-6 text-sm text-gray-500">
        {[
          { icon: Globe, label: "Global Coverage" },
          { icon: Mountain, label: "Real-time Data" },
          { icon: TrendingUp, label: "AI-Powered Insights" },
        ].map(({ icon: Icon, label }, index, arr) => (
          <div key={label} className="flex items-center space-x-2">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {index < arr.length - 1 && (
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Header;

