"use client";

import React from "react";
import { Check, X, Users, Briefcase, Target, Plus, User } from "lucide-react";

export default function TeamsOverviewPage() {
  return (
    <div className="h-full bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Team Setup Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold">Finish setting up your team</h2>
              <span className="text-gray-400 text-sm">1 of 3 steps completed</span>
            </div>
            <button className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Add team description - Completed */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Add team description</h3>
                  <p className="text-gray-400 text-sm">
                    Describe your team's purpose and responsibilities
                  </p>
                </div>
              </div>
            </div>

            {/* Add work */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mt-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Add work</h3>
                  <p className="text-gray-400 text-sm">
                    Link existing projects, portfolios, or templates your team may find helpful
                  </p>
                </div>
              </div>
            </div>

            {/* Add teammates */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center mt-1">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Add teammates</h3>
                  <p className="text-gray-400 text-sm">
                    Start collaborating by inviting teammates to your new team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Curated work */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Curated work</h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                View all work
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {/* Work items */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-600 rounded mb-2" style={{ width: '60%' }}></div>
                    <div className="h-2 bg-gray-700 rounded" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-600 rounded mb-2" style={{ width: '45%' }}></div>
                    <div className="h-2 bg-gray-700 rounded" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-600 rounded mb-2" style={{ width: '55%' }}></div>
                    <div className="h-2 bg-gray-700 rounded" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add work section */}
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Organize links to important work such as portfolios, projects, 
                templates, etc, for your team members to find easily.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                Add work
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Members</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  View all 1
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    LC
                  </div>
                  <div className="w-10 h-10 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Goals</h3>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Create goal
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-center">
                  <Target className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">This team hasn't created any goals yet</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Add a goal so the team can see what you hope to achieve.
                  </p>
                  
                  {/* Progress indicator */}
                  <div className="mt-6">
                    <div className="h-2 bg-gray-700 rounded-full mb-2">
                      <div className="h-2 bg-gray-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        On track (0%)
                      </span>
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}