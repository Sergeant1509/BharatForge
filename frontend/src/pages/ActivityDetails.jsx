import React from 'react'

const ActivityDetails = () => {
  return (
    <div>
      <h2 className='text-2xl font-semibold'>Compressor Foundation</h2>
      <p className='text-gray-400 mt-1'>Activity ID: A103</p>
      <div className='grid grid-cols-4 gap-4 mt-8'>
        {[
      ["Planned Progress", "88%"],
      ["Actual Progress", "65%"],
      ["Risk", "HIGH"],].map(([label, value]) => (
        <div 
        key={label}
         className="bg-[#151b24] border border-[#252d38] rounded-xl p-5"
        >
          <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
      ))}
      </div>
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className='text-lg font-semibold'>Linked Field Evidence</h3>

        <div className='mt-5 space-y-3'>
        <div className='bg-[#10151c] rounded-lg p-4'>
            <p className='font-medium'>FR-1023</p>
            <p className='text-gray-400 text-sm mt-2'>Reinforcement work is 65% complete</p>
        </div>
        <div className='bg-[#10151c] rounded-lg p-4'>
          <p className='font-medium'>FR-1031</p>
          <p className='text-gray-400 text-sm mt-2'>Steel Shortage has slowed the work</p>
        </div>
        </div>
      </div>
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
  <h3 className="text-lg font-semibold">Schedule & Impact</h3>

  <div className="grid grid-cols-3 gap-4 mt-5">
    <div>
      <p className="text-gray-400 text-sm">Planned Finish</p>
      <p className="mt-1">15 Sept 2026</p>
    </div>

    <div>
      <p className="text-gray-400 text-sm">Current Forecast</p>
      <p className="mt-1">19 Sept 2026</p>
    </div>

    <div>
      <p className="text-gray-400 text-sm">Potential Delay</p>
      <p className="mt-1 text-red-400">4 Days</p>
    </div>
  </div>
</div>
    </div>
  )
}

export default ActivityDetails
