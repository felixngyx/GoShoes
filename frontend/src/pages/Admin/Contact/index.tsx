import { useEffect, useState } from 'react';
import axiosClient from '../../../apis/axiosClient';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';


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



  const handleDeleteContact = async (id: number) => {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'bg-white shadow rounded-lg p-4 max-w-[500px]',
        title: 'text-base font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600',
        confirmButton:
          'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2',
        cancelButton:
          'bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400',
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const message = toast.loading('Đang xóa liên hệ...');
          await axiosClient.get(`/delete/${id}`);
          toast.dismiss(message);
          setContacts(contacts.filter(c => c.id !== id));
        } catch (error) {
          console.error('Không thể xóa liên hệ');
        }
      }
    })

  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6">Tin nhắn liên hệ</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">STT</th>
              <th className="px-4 py-2">Họ và tên</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Chủ đề</th>
              <th className="px-4 py-2">Tin nhắn</th>
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
                    Trả lời
                  </button>
                  <button
                    onClick={async () => {

                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                  >
                    Xóa
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