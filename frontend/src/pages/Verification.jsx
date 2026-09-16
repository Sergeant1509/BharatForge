import React from 'react'
import { useState } from "react"



const cases = [
  {
    id: "A103",
    activity: "Compressor Foundation",
    reported: "100%",
    previous: "60%",
    confidence: "LOW",
    reason: "Material data inconsistent",
  },
  {
    id: "A221",
    activity: "Main Piping Installation",
    reported: "85%",
    previous: "70%",
    confidence: "MEDIUM",
    reason: "Supporting evidence missing",
  },
]



const Verification = () => {
  
  const [items, setItems] = useState(cases)
   return (
    <div>
      <h2 className="text-2xl font-semibold">Verification Queue</h2>

      <p className="text-gray-400 mt-2">
        Review uncertain execution updates
      </p>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[#151b24] border border-[#252d38] rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-semibold">{item.activity}</p>
                <p className="text-sm text-gray-500 mt-1">{item.id}</p>
              </div>
              <span className="text-red-400 text-sm font-semibold">
                {item.confidence}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-gray-400 text-sm">Reported</p>
                <p className="mt-1">{item.reported}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Previous</p>
                <p className="mt-1">{item.previous}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Reason</p>
                <p className="mt-1">{item.reason}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
              onClick={()=> setItems(items.filter((x)=>x.id!==item.id))}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700">
                Confirm
              </button>

              <button
              onClick={()=> setItems(items.filter((x)=>x.id!==item.id))}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700">
                Reject
              </button>

              <button className="px-4 py-2 rounded-lg bg-[#252d38] hover:bg-[#303a47]">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Verification