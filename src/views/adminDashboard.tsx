import React from 'react';
import View from './view';
import { useNavigate } from 'react-router-dom';
import NotFound from './notFound';
import Button from '../components/button';
import { pizzaService } from '../service/service';
import { Franchise, FranchiseList, UserList, Role, Store, User } from '../service/pizzaService';
import { TrashIcon } from '../icons';

interface Props {
  user: User | null;
}

export default function AdminDashboard(props: Props) {
  const navigate = useNavigate();
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({ franchises: [], more: false });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const [userList, setUserList] = React.useState<UserList>({ users: [], more: false });
  const [userPage, setUserPage] = React.useState(0);
  const filterFranchiseRef = React.useRef<HTMLInputElement>(null);
  const filterUserRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    (async () => {
      setFranchiseList(await pizzaService.getFranchises(franchisePage, 3, '*'));
      setUserList(await pizzaService.listUsers(userPage, 10, '*'));
    })();
  }, [props.user, franchisePage, userPage]);

  function createFranchise() {
    navigate('/admin-dashboard/create-franchise');
  }

  async function closeFranchise(franchise: Franchise) {
    navigate('/admin-dashboard/close-franchise', { state: { franchise: franchise } });
  }

  async function closeStore(franchise: Franchise, store: Store) {
    navigate('/admin-dashboard/close-store', { state: { franchise: franchise, store: store } });
  }

  async function filterFranchises() {
    setFranchiseList(await pizzaService.getFranchises(franchisePage, 10, `*${filterFranchiseRef.current?.value}*`));
  }

async function deleteUser(user: User) {
    try {
        await pizzaService.deleteUser(user);
        setUserPage(0); 
        alert(`${user.name} has been deleted.`);
    } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Check the console for details.');
    }
}

  async function filterUsers() {
    setUserList(await pizzaService.listUsers(userPage, 10, `*${filterUserRef.current?.value}*`));
  }

  let response = <NotFound />;
  if (Role.isRole(props.user, Role.Admin)) {
    response = (
      <View title="Mama Ricci's kitchen">
        <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
          <h3 className="text-neutral-100 text-xl">Franchises</h3>
          <div className="bg-neutral-100 overflow-clip my-4">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                        <tr>
                          {['Franchise', 'Franchisee', 'Store', 'Revenue', 'Action'].map((header) => (
                            <th key={header} scope="col" className="px-6 py-3 text-center text-xs font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      {franchiseList.franchises.map((franchise, findex) => {
                        return (
                          <tbody key={findex} className="divide-y divide-gray-200">
                            <tr className="border-neutral-500 border-t-2">
                              <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">{franchise.name}</td>
                              <td className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800" colSpan={3}>
                                {franchise.admins?.map((o) => o.name).join(', ')}
                              </td>
                              <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400  hover:border-orange-800 hover:text-orange-800" onClick={() => closeFranchise(franchise)}>
                                  <TrashIcon />
                                  Close
                                </button>
                              </td>
                            </tr>

                            {franchise.stores.map((store, sindex) => {
                              return (
                                <tr key={sindex} className="bg-neutral-100">
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800" colSpan={3}>
                                    {store.name}
                                  </td>
                                  <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">{store.totalRevenue?.toLocaleString()} ₿</td>
                                  <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                    <button type="button" className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={() => closeStore(franchise, store)}>
                                      <TrashIcon />
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        );
                      })}
                      <tfoot>
                        <tr>
                          <td className="px-1 py-1">
                            <input type="text" ref={filterFranchiseRef} name="filterFranchise" placeholder="Filter franchises" className="px-2 py-1 text-sm border border-gray-300 rounded-lg" />
                            <button type="submit" className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800" onClick={filterFranchises}>
                              Submit
                            </button>
                          </td>
                          <td colSpan={4} className="text-end text-sm font-medium">
                            <button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300 " onClick={() => setFranchisePage(franchisePage - 1)} disabled={franchisePage <= 0}>
                              «
                            </button>
                            <button className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300" onClick={() => setFranchisePage(franchisePage + 1)} disabled={!franchiseList.more}>
                              »
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Button className="w-36 text-xs sm:text-sm sm:w-64" title="Add Franchise" onPress={createFranchise} />
          </div>
          <h3 className="text-neutral-100 text-xl">Users</h3>
          <div className="bg-neutral-100 overflow-clip my-4 border border-gray-300">
            <div className="flex flex-col">
              <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="text-gray-800 bg-white border-b border-gray-200">
                        <tr>
                          {['Name', 'Email', 'Role', 'Action'].map((header) => (
                            <th 
                              key={header} 
                              scope="col" 
                              className={`px-3 py-3 text-sm font-bold text-start ${header === 'Action' ? 'w-10' : ''}`}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {userList.users.map((user) => (
                          <tr key={user.id} className="bg-white hover:bg-neutral-50">
                            <td className="text-start px-3 py-1.5 whitespace-nowrap text-sm font-normal text-gray-800">
                              {user.name}
                            </td>
                            <td className="text-start px-3 py-1.5 whitespace-nowrap text-sm font-normal text-gray-800">
                              {user.email}
                            </td>
                            <td className="text-start px-3 py-1.5 whitespace-nowrap text-sm font-normal text-gray-800">
                              {user.roles && user.roles.length > 0 ? user.roles[0].role : 'No Role'}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-sm font-medium text-center w-10">
                              <button 
                                type="button" 
                                className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                                aria-label={`Delete user ${user.name}`}  
                                onClick={() => deleteUser(user)}
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t border-gray-200 bg-white">
                        <tr>
                          <td className="px-3 py-2" colSpan={2}>
                            <input 
                              type="text" 
                              ref={filterUserRef} 
                              name="filterUser" 
                              placeholder="Name" 
                              className="px-2 py-1 text-sm border border-gray-300 rounded-lg w-full" 
                            />
                          </td>
                          <td className="px-3 py-2" colSpan={1}>
                            <button 
                              type="button" 
                              className="w-full py-1 text-sm font-semibold rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100" 
                              onClick={filterUsers}
                            >
                              Search
                            </button>
                          </td>
                          <td className="px-3 py-2 text-end" colSpan={1}>
                            <button 
                              className="w-10 p-1 text-sm font-semibold rounded-lg border border-gray-300 bg-white m-0.5 hover:bg-gray-100 disabled:bg-neutral-300" 
                              onClick={() => setUserPage(userPage - 1)} 
                              disabled={userPage <= 0}
                            >
                              Prev
                            </button>
                            <button 
                              className="w-10 p-1 text-sm font-semibold rounded-lg border border-gray-300 bg-white m-0.5 hover:bg-gray-100 disabled:bg-neutral-300" 
                              onClick={() => setUserPage(userPage + 1)} 
                              disabled={!userList.more}
                            >
                              Next
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </View>
    );
  }

  return response;
}
