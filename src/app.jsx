function App() {
  return (
    <div className="container mx-auto p-4">
      {/* Migrate the header section */}
      <header className="bg-white/40 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-white/20">
        <nav className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-gray-800">Ostumenetluse kutse - Hankest.ee</h1>
          <div className="flex space-x-4">
            <a href="#" className="nav-link">
              Info
            </a>
            <a href="#" className="nav-link">
              Põhiandmed
            </a>
            <a href="#" className="nav-link">
              Ajalugu
            </a>
          </div>
        </nav>
      </header>

      {/* Migrate the tabs section */}
      <div className="flex space-x-1 mt-5">
        <button className="px-4 py-2 rounded-t-lg font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10">
          Info
        </button>
        <button className="px-4 py-2 rounded-t-lg font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10">
          Põhiandmed
        </button>
        <button className="px-4 py-2 rounded-t-lg font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10">
          Ajalugu
        </button>
      </div>

      {/* Migrate the content section */}
      <div className="p-6 bg-white/90">
        <div className="space-y-8">
          <div className="flex items-center space-x-3 mb-6">
            <i className="fas fa-cog text-2xl text-gray-700"></i>
            <h3 className="text-2xl font-bold text-gray-800">Seadete info</h3>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mr-4">
                <i className="fas fa-info-circle text-indigo-600"></i>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Põhiandmed</h4>
                <p className="text-gray-600 mt-2">Siin on põhiandmed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
