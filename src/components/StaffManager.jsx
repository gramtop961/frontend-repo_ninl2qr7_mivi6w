import React, { useRef } from 'react';
import { Users, Plus } from 'lucide-react';

const StaffManager = ({ staff, onAddStaff }) => {
  const formRef = useRef(null);

  const handleAdd = (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    const name = (fd.get('name') || '').toString().trim();
    const role = (fd.get('role') || '').toString().trim();
    const phone = (fd.get('phone') || '').toString().trim();
    if (!name) return;
    onAddStaff({ name, role, phone });
    formRef.current.reset();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold">Staff</h3>
        </div>
        <span className="text-xs text-slate-500">Add your staff to this business</span>
      </div>

      <form ref={formRef} onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input name="name" placeholder="Full name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="role" placeholder="Role (e.g., Manager)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="phone" placeholder="Phone" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.role}</td>
                <td className="p-2">{s.phone}</td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-slate-500">No staff added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManager;
