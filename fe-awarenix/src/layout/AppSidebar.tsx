// AppSidebar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Perbaiki import Link
import { MdOutlineAttachEmail } from "react-icons/md";
import { CgWebsite } from "react-icons/cg";
import { IoIosBookmarks } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { DiEnvato } from "react-icons/di";
import { FaUserCog } from "react-icons/fa";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  MailIcon,
  TableIcon,
  UserIcon,
} from "../icons";
import { IoFootstepsOutline } from "react-icons/io5";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { User } from "lucide-react";
import { useUserSession } from "../components/context/UserSessionContext";

type SubItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

type NavGroup = {
  title: string;
  key: string;
  items: NavItem[];
};

// Data Navigasi Awal (semua kemungkinan menu/submenu)
const allNavGroups: NavGroup[] = [ // Rename to allNavGroups
  {
    title: "Admin",
    key: "main",
    items: [
      { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
      { icon: <CalenderIcon />, name: "Campaigns", path: "/campaigns" },
      { icon: <FaUserCog size={5}/>, name: "Role Management", path: "/role-management" },
      { icon: <User />, name: "User Management", path: "/user-management" },
      { icon: <GroupIcon />, name: "Groups & Members", path: "/groups-members" },
      { icon: <MailIcon />, name: "Email Templates", path: "/email-templates" },
      { icon: <TableIcon />, name: "Landing Pages", path: "/landing-pages" },
      { icon: <UserIcon />, name: "Sending Profiles", path: "/sending-profiles" },
    ],
  },
  {
    title: "Phishing & Simulation",
    key: "phishing-simulation",
    items: [
      { icon: <MdOutlineAttachEmail />, name: "Phishing Emails", path: "/phishing-emails" },
      { icon: <CgWebsite />, name: "Phishing Websites", path: "/phishing-websites" }, 
      { name: "Training Modules", icon: <IoIosBookmarks />, path: "/training-modules" }, 
    ],
  },
  {
    title: "User",
    key: "user",
    items: [
      { icon: <IoSettingsOutline />, name: "Account Settings", path: "/account-settings" },
      { icon: <FaMoneyCheckAlt />, name: "Subcription & Billing", path: "/subscription-billing" },
    ],
  },
  {
    title: "Logging & Monitoring",
    key: "logging-monitoring",
    items: [
      { icon: <IoFootstepsOutline />, name: "Logging Activity", path: "/logging-activity" },
      { icon: <DiEnvato />, name: "Environtment Check", path: "/environtment-check" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useUserSession(); // Ambil user dari context
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: string;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Filter navGroups berdasarkan allowed_submenus dari user session
  const filteredNavGroups = allNavGroups.map(group => {
    const filteredItems = group.items.filter(item => {
      // Jika item adalah menu utama tanpa sub-item
      if (item.path && user?.allowed_submenus?.includes(item.path)) {
        return true;
      }
      // Jika item adalah menu dengan sub-item
      if (item.subItems) {
        // Cek apakah ada minimal satu sub-item yang diizinkan
        const hasAllowedSubitem = item.subItems.some(subItem => user?.allowed_submenus?.includes(subItem.path));
        return hasAllowedSubitem;
      }
      return false; // Item tidak diizinkan jika tidak ada path atau subItems yang cocok
    });
    return { ...group, items: filteredItems };
  }).filter(group => group.items.length > 0); // Hapus grup yang tidak memiliki item yang diizinkan


  useEffect(() => {
    let submenuMatched = false;
    filteredNavGroups.forEach((group) => { // Gunakan filteredNavGroups
      group.items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: group.key,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredNavGroups]); // Tambahkan filteredNavGroups sebagai dependency

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: string) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => { // Hapus index dari map, karena sudah difilter
        // Tidak perlu cek izin di sini lagi, karena items sudah difilter di atas
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              // Perlu menemukan index yang benar untuk submenu yang dibuka
              // Ini akan sedikit tricky jika item.path tidak unik.
              // Alternatif: simpan index asli dari allNavGroups
              <button
                onClick={() => {
                  const originalNavIndex = allNavGroups.find(g => g.key === menuType)?.items.findIndex(i => i.name === nav.name);
                  if (originalNavIndex !== undefined) {
                    handleSubmenuToggle(originalNavIndex, menuType);
                  }
                }}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && allNavGroups.find(g => g.key === menuType)?.items[openSubmenu.index]?.name === nav.name
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType && allNavGroups.find(g => g.key === menuType)?.items[openSubmenu.index]?.name === nav.name
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType && allNavGroups.find(g => g.key === menuType)?.items[openSubmenu.index]?.name === nav.name
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                    // Perlu index asli untuk ref
                    const originalNavIndex = allNavGroups.find(g => g.key === menuType)?.items.findIndex(i => i.name === nav.name);
                    if (originalNavIndex !== undefined) {
                      subMenuRefs.current[`${menuType}-${originalNavIndex}`] = el;
                    }
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && allNavGroups.find(g => g.key === menuType)?.items[openSubmenu.index]?.name === nav.name
                      ? `${subMenuHeight[`${menuType}-${allNavGroups.find(g => g.key === menuType)?.items.findIndex(i => i.name === nav.name)}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    // Filter sub-item di sini juga (meskipun grup sudah difilter, ini memastikan jika ada menu yang punya sub-item sebagian diizinkan)
                    user?.allowed_submenus?.includes(subItem.path) && (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-2 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={`${import.meta.env.VITE_BASE_URL}/images/logo/auth-logo-light.png`}
                alt="Logo"
                width={70}
                height={50}
              />
              <img
                className="hidden dark:block"
                src={`${import.meta.env.VITE_BASE_URL}/images/logo/auth-logo.png`}
                alt="Logo"
                width={70}
                height={50}
              />
            </>
          ) : (
            <img
              src={`${import.meta.env.VITE_BASE_URL}/images/logo/auth-logo.png`}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {filteredNavGroups.map((group) => ( // Gunakan filteredNavGroups
              <div key={group.title}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-900 font-semibold dark:text-gray-500 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    group.title
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(group.items, group.key)}
              </div>
            ))}
          </div>
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;