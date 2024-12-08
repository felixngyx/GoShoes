import { useEffect, useState } from 'react';
import axiosClient from '../../../apis/axiosClient';


interface Contact {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axiosClient.get('/contacts');
        setContacts(response.data.data);
      } catch (error) {
        setError('Failed to fetch contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6">Contact Messages</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">No.</th>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr key={contact.id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{contact.full_name}</td>
                <td className="border px-4 py-2">{contact.email}</td>
                <td className="border px-4 py-2">{contact.subject}</td>
                <td className="border px-4 py-2">{contact.message}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => window.location.href = `mailto:${contact.email}`}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reply
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this contact?')) {
                        try {
                          await axiosClient.get(`/delete/${contact.id}`);
                          setContacts(contacts.filter(c => c.id !== contact.id));
                        } catch (error) {
                          console.error('Failed to delete contact');
                        }
                      }
                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;