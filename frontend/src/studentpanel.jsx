import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function StudentPanel() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/api/course-materials`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to fetch course materials. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const filteredMaterials = materials.filter(material => 
    material.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading course materials...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div key={material._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{material.courseName}</h2>
                    <p className="text-gray-600 mb-1"><span className="font-medium">Topic:</span> {material.topic}</p>
                    <p className="text-gray-600 mb-1"><span className="font-medium">Unit:</span> {material.unitName}</p>
                    <p className="text-gray-600 mb-1"><span className="font-medium">Date:</span> {formatDate(material.date)}</p>
                    {material.extraInfo && (
                      <p className="text-gray-600 mb-4"><span className="font-medium">Notes:</span> {material.extraInfo}</p>
                    )}
                    <a
                      href={`${API_BASE_URL}/api/files/${material.pdfFilename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No course materials found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPanel;
