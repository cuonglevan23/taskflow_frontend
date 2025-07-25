export default function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage your tasks here</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          New Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
        </div>
        <div className="divide-y">
          <div className="p-4 flex items-center space-x-3">
            <input type="checkbox" className="rounded border-gray-300" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                Review project proposal
              </h3>
              <p className="text-sm text-gray-500">Due: Today at 5:00 PM</p>
            </div>
            <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
              High
            </span>
          </div>

          <div className="p-4 flex items-center space-x-3">
            <input type="checkbox" className="rounded border-gray-300" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                Update documentation
              </h3>
              <p className="text-sm text-gray-500">Due: Tomorrow</p>
            </div>
            <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              Medium
            </span>
          </div>

          <div className="p-4 flex items-center space-x-3">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-300"
            />
            <div className="flex-1 opacity-75">
              <h3 className="font-medium text-gray-900 line-through">
                Setup development environment
              </h3>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
