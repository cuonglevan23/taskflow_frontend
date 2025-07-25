export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects here</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Project Alpha
          </h3>
          <p className="text-gray-600 mb-4">Website redesign project</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
              Active
            </span>
            <span className="text-sm text-gray-500">75% complete</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Project Beta
          </h3>
          <p className="text-gray-600 mb-4">Mobile app development</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              In Progress
            </span>
            <span className="text-sm text-gray-500">45% complete</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Project Gamma
          </h3>
          <p className="text-gray-600 mb-4">API integration</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Planning
            </span>
            <span className="text-sm text-gray-500">10% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
