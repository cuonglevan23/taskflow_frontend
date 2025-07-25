export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
            <p className="text-gray-600 mt-1">Friday, July 25</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg p-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, LÊ
          </h2>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>0 tasks completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">👥</span>
              <span>0 collaborators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My tasks</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex space-x-6 mt-4">
              <button className="text-sm font-medium text-gray-900 border-b-2 border-orange-500 pb-1">
                Upcoming
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Overdue (2)
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Completed
              </button>
            </div>
          </div>

          <div className="p-6">
            <button className="w-full flex items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <div className="text-center">
                <div className="h-8 w-8 bg-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Create task</p>
              </div>
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
              <button className="text-sm text-gray-600 hover:text-gray-800">
                Recents
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button className="flex items-center justify-center w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <div className="flex-1 ml-4">
                <button className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Create project
                  </p>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CF</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  Cross-functional
                </h4>
                <p className="text-xs text-gray-500">1 task due soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks I've assigned */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Tasks I&apos;ve assigned
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex space-x-6 mt-4">
              <button className="text-sm font-medium text-gray-900 border-b-2 border-orange-500 pb-1">
                Upcoming
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Overdue
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Completed
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Assign tasks to your colleagues, and keep track of them here.
              </p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
              <select className="text-sm border-0 text-gray-600 focus:ring-0">
                <option>LÊ&apos;s first team</option>
              </select>
            </div>

            <div className="flex space-x-6 mt-4">
              <button className="text-sm font-medium text-gray-900 border-b-2 border-orange-500 pb-1">
                My goals
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Team
              </button>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Company
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center py-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                You haven&apos;t added team goals yet.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Add a goal so your team knows what you plan to achieve.
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Create goal
              </button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 ml-4">
                  90%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
