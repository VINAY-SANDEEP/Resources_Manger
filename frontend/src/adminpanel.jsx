import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    courseName: '',
    topic: '',
    date: '',
    unitName: '',
    extraInfo: '',
    pdfFile: null
  });
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/course-materials');
      setMaterials(response.data);
    } catch (error) {
      setError('Error fetching course materials');
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      pdfFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('courseName', formData.courseName);
      formDataToSend.append('topic', formData.topic);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('unitName', formData.unitName);
      formDataToSend.append('extraInfo', formData.extraInfo);
      formDataToSend.append('pdfFile', formData.pdfFile);

      if (editingId) {
        await axios.put(`http://localhost:5000/api/course-materials/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Course material updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/upload', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Course material uploaded successfully!');
      }

      setFormData({
        courseName: '',
        topic: '',
        date: '',
        unitName: '',
        extraInfo: '',
        pdfFile: null
      });
      setEditingId(null);
      fetchMaterials();
    } catch (error) {
      setError(error.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/course-materials/${id}`);
      setSuccess('Course material deleted successfully!');
      fetchMaterials();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting material');
    }
  };

  const handleEdit = (material) => {
    setEditingId(material._id);
    setFormData({
      courseName: material.courseName,
      topic: material.topic,
      date: material.date.split('T')[0],
      unitName: material.unitName,
      extraInfo: material.extraInfo || '',
      pdfFile: null
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Upload/Edit Form */}
          <div className="bg-white shadow rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              {editingId ? 'Edit Course Material' : 'Upload Course Material'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                  Course Name
                </label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="unitName" className="block text-sm font-medium text-gray-700">
                  Unit Name
                </label>
                <input
                  type="text"
                  id="unitName"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="extraInfo" className="block text-sm font-medium text-gray-700">
                  Extra Information
                </label>
                <textarea
                  id="extraInfo"
                  name="extraInfo"
                  value={formData.extraInfo}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
                  PDF File {editingId && <span className="text-gray-500">(Leave empty to keep existing file)</span>}
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  name="pdfFile"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                  required={!editingId}
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editingId ? 'Update Material' : 'Upload Material')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        courseName: '',
                        topic: '',
                        date: '',
                        unitName: '',
                        extraInfo: '',
                        pdfFile: null
                      });
                    }}
                    className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Materials List */}
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Uploaded Materials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <div key={material._id} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.courseName}</h3>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Topic:</span> {material.topic}</p>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Unit:</span> {material.unitName}</p>
                  <p className="text-gray-600 mb-1"><span className="font-medium">Date:</span> {formatDate(material.date)}</p>
                  {material.extraInfo && (
                    <p className="text-gray-600 mb-4"><span className="font-medium">Notes:</span> {material.extraInfo}</p>
                  )}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleEdit(material)}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
