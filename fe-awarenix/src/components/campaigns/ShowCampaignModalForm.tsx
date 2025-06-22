import { useState, useEffect } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { TimeIcon } from "../../icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { FaEye } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { BiUser } from "react-icons/bi";
import Select from '../form/Select'
import DatePicker from "../form/date-picker";
import Checkbox from "../form/input/Checkbox";
import React from "react";
import Card from "../common/Card";
import CardContent from "../common/CardContent";
import SelectableCard from "../common/SelectableCard";
import Button from "../ui/button/Button";

export default function ShowCampaignModalForm() {
  const isMobile = useMediaQuery({ maxWidth: 640 }); // sm breakpoint
  const [campaignType, setCampaignType] = useState<string | null>(null);
  const [phisingSchedule, setphisingSchedule] = useState<string | null>(null);
  const [frequencyTraining, setFrequencyTraining] = useState<string | null>(null);

  // Groups and Users
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  const showPhishingSchedule = campaignType == "1" || campaignType == "3";
  const showFrequencyTraining = campaignType == "2" || campaignType == "3";
  const showSetupSchedule = phisingSchedule == "2"
  const showFrequencySchedule = frequencyTraining == "2" || frequencyTraining == "3"  || frequencyTraining == "4"  || frequencyTraining == "5";

  const campaignTypeOptions = [
    { value: "1", label: "Phising Simulation"},
    { value: "2", label: "Training Modules"},
    { value: "3", label: "Phising Simulation & Training Modules"},
  ];

  const trainingFrequencyOptions = [
    { value: "1", label: "One-off"},
    { value: "2", label: "Daily"},
    { value: "3", label: "Weekly"},
    { value: "4", label: "Monthly"},
    { value: "5", label: "Yearly"},
  ];

  const phisingScheduleOptions = [
    { value: "1", label: "Delivery Immediately" },
    { value: "2", label: "Setup Schedule" },
    { value: "3", label: "Schedule Later" },
  ];

  const groups = [
    {
      id: 1,
      name: "IT Dev",
      member: 2,
      users: [
        { name: "John Doe", email: "john@company.com", position: "Developer" },
        { name: "Jane Smith", email: "jane@company.com", position: "Tester" },
      ],
    },
    {
      id: 2,
      name: "Finance",
      member: 2,
      users: [
        { name: "Rick Rogers", email: "rick@company.com", position: "Accountant" },
        { name: "Lily Tran", email: "lily@company.com", position: "Auditor" },
      ],
    },
    {
      id: 3,
      name: "Management",
      member: 2,
      users: [
        { name: "Mark Lee", email: "mark@company.com", position: "Manager" },
        { name: "Sally Kim", email: "sally@company.com", position: "Assistant" },
      ],
    },
  ];

  // CHECK GROUPS AND USERS
  const [searchQuery, setSearchQuery] = useState("");
  // const [checkedGroups, setCheckedGroups] = useState<string[]>([]);
  const [checkedGroups, setCheckedGroups] = useState<Record<number, boolean>>({});


  useEffect(() => {
    const initialChecks: Record<number, boolean> = Object.fromEntries(
      groups.map((group) => [group.id, false])
    );
    setCheckedGroups(initialChecks);
  }, []);
  
  const toggleExpand = (index: number) => {
    setExpandedGroup(prev => (prev === index ? null : index));
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allChecked = Object.values(checkedGroups).every((val) => val);
  const totalCheckedMember = filteredGroups.reduce((sum, group) => {
    return checkedGroups[group.id] ? sum + group.member : sum;
  }, 0);


  const toggleCheckAll = () => {
    const newChecked = !allChecked;
    const updated: Record<number, boolean> = { ...checkedGroups };

    filteredGroups.forEach((group) => {
      updated[group.id] = newChecked;
    });

    setCheckedGroups(updated);
  };
  
  const toggleCheckGroup = (id: number, checked: boolean) => {
    setCheckedGroups((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // const handleGroupCheck = (id: number, checked: boolean) => {
  //   setCheckedGroups((prev) => ({
  //     ...prev,
  //     [id]: checked,
  //   }));
  // };

  // PHISING MATERIAL
  const [selectedIndexesPhisingMaterial, setSelectedIndexesPhisingMaterial] = useState<number[]>([]);
  const phishingMaterials = [
    {
      title: "DocuSign-Sign-Document",
      interactionRate: 23,
      payload: "Website",
      image: "/images/phising-material/docusign.png",
    },
    {
      title: "Google-Meeting-Invite",
      interactionRate: 22,
      payload: "Website",
      image: "/images/phising-material/google-meet.png",
    },
    {
      title: "Zoom-Invite",
      interactionRate: 11,
      payload: "Website",
      image: "/images/phising-material/zoom.png",
    },
  ];

  const toggleSelectCardPhisingMaterial = (idx: number) => {
    setSelectedIndexesPhisingMaterial((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };


  // Training Module
  const [selectedIndexesTrainingModule, setSelectedIndexesTrainingModule] = useState<number[]>([]);
  const trainingModules = [
    {
      title: "Phishing",
      skillLevel: "Beginner",
      timeEstimate: "7 minutes",
      image: "/images/training-module/phishing.png",
    },
    {
      title: "Ransomware",
      skillLevel: "Beginner",
      timeEstimate: "7 minutes",
      image: "/images/training-module/ransomware.png",
    },
  ];

  const toggleSelectCardTrainingModule = (idx: number) => {
    setSelectedIndexesTrainingModule((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };


  return (
    <div className="space-y-6 overflow-visible mb-0">
      {/* Campaign Name */}
      {isMobile ? (
        <>
          <div className="grid grid-cols-1 overflow-visible">
            <Label>Campaign Name</Label>
            <Input
              placeholder="Campaign A"
              type="text"
              className="w-full text-sm sm:text-base h-10 px-3"
              required
            />

            <div className="relative mt-2 z-[991]">
              <Label>Campaign Type</Label>
              <Select
                options={campaignTypeOptions}
                onChange={(value) => {
                  setCampaignType(value);
                  setphisingSchedule(null);
                  setFrequencyTraining(null);
                }}
                required
                />
            </div>

            {showPhishingSchedule && (
              <div className="relative mt-2 mb-2 z-[99]">
                <Label>Phishing Schedule</Label>
                <Select
                  options={phisingScheduleOptions}
                  value={phisingSchedule ?? ""}
                  onChange={(value) => setphisingSchedule(value)}
                  required
                />
              </div>
            )}

            {showFrequencyTraining && (
              <div className="mt-2">
                <Label>Frequency Training</Label>
                <Select
                  options={trainingFrequencyOptions}
                  value={frequencyTraining ?? ""}
                  onChange={(value) => setFrequencyTraining(value)}
                  required
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 overflow-visible">
            {showSetupSchedule && (
              <>
                <DatePicker
                  id="date-picker"
                  label="Date Schedule Phising"
                  placeholder="Select a date"
                  onChange={(dates, currentDateString) => {
                    console.log({ dates, currentDateString });
                  }}
                />
                <div className="mt-3">
                  <Label htmlFor="tm">Time Schedule Phising</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="tm"
                      name="tm"
                      lang="id"
                      onChange={(e) => console.log(e.target.value)}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <TimeIcon className="size-6" />
                    </span>
                  </div>
                </div>
              </>
            )}

            {showFrequencySchedule && (
              <>
                <h4 className="text-gray-500 dark:text-gray-300 mb-2">Expire after</h4>
                <DatePicker
                  id="date-picker"
                  label="Date Frequency Training"
                  placeholder="Select a date"
                  onChange={(dates, currentDateString) => {
                    console.log({ dates, currentDateString });
                  }}
                />
                <div className="mt-3">
                  <Label htmlFor="tm">Time Frequency Training</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="tm"
                      name="tm"
                      lang="id"
                      onChange={(e) => console.log(e.target.value)}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <TimeIcon className="size-6" />
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </>  
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 overflow-visible">
            <div>
              <Label>Campaign Name</Label>
              <Input
                placeholder="Campaign A"
                type="text"
                className="w-full text-sm sm:text-base h-10 px-3"
              />
            </div>

            <div>
              <Label>Campaign Type</Label>
              <Select
                options={campaignTypeOptions}
                value={campaignType ?? ""}
                onChange={(value) => {
                  setCampaignType(value);
                  setphisingSchedule(null);
                  setFrequencyTraining(null);
                }}
                required
              />
            </div>

            {showPhishingSchedule && (
              <div>
                <Label>Phising Schedule</Label>
                <Select
                  options={phisingScheduleOptions}
                  value={phisingSchedule ?? ""}
                  onChange={(value) => setphisingSchedule(value)}
                  required
                />
              </div>
            )}

            {showFrequencyTraining && (
              <div>
                <Label>Frequency Training</Label>
                <Select
                  options={trainingFrequencyOptions}
                  value={frequencyTraining ?? ""}
                  onChange={(value) => setFrequencyTraining(value)}
                  required
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4 overflow-visible">
            {showSetupSchedule && (
              <>
                <div>
                  <h4 className="text-gray-500 dark:text-gray-300 mb-2">Starting on</h4>
                  <DatePicker
                    id="date-picker"
                    label="Date Schedule Phising"
                    placeholder="Select a date"
                    onChange={(dates, currentDateString) => {
                      console.log({ dates, currentDateString });
                    }}
                  />
                </div>
                <div className="mt-8 max-w-fit">
                  <Label htmlFor="tm">Time Schedule Phising</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="tm"
                      name="tm"
                      lang="id"
                      onChange={(e) => console.log(e.target.value)}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <TimeIcon className="size-6" />
                    </span>
                  </div>
                </div>
              </>
              )}

              {showFrequencySchedule && (
                <>
                  <div>
                    <h4 className="text-gray-500 dark:text-gray-300 mb-2">Expire after</h4>
                    <DatePicker
                      id="date-picker"
                      label="Date Frequency Training"
                      placeholder="Select a date"
                      onChange={(dates, currentDateString) => {
                        console.log({ dates, currentDateString });
                      }}
                    />
                  </div>
                  <div className="mt-8">
                    <Label htmlFor="tm">Time Frequency Training</Label>
                    <div className="relative">
                      <Input
                        type="time"
                        id="tm"
                        name="tm"
                        lang="id"
                        onChange={(e) => console.log(e.target.value)}
                      />
                      <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <TimeIcon className="size-6" />
                      </span>
                    </div>
                  </div>
                </>
              )}
          </div>
        </>
      )}

      {/* Group List */}
      <h4 className="xl:text-lg dark:text-gray-400 mb-2 mt-0"><li>Group List</li></h4>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Search Box */}
        <div className="flex-1">
          <div className="flex border rounded shadow-sm overflow-hidden bg-white dark:bg-gray-800 dark:border-gray-600">
            <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm gap-1">
              Search
            </div>
            <input
              type="text"
              placeholder="Search for a specific employee list"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Select All + Total Employees */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded overflow-hidden bg-white dark:bg-gray-800">
            <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm gap-1">
              Select All
            </div>
            <div className="px-2 bg-white dark:bg-gray-800 flex items-center justify-center">
              <Checkbox checked={allChecked} onChange={toggleCheckAll} />
            </div>
          </div>

          <div className="flex items-center border rounded overflow-hidden bg-white dark:bg-gray-800">
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm">
              Total Employees
            </div>
            <div className="px-3 py-2 bg-white dark:bg-gray-800 font-bold text-sm text-gray-800 dark:text-white">
              {totalCheckedMember}
            </div>
          </div>
        </div>
      </div>

      {isMobile ? (
        // MOBILE: Collapse style
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const originalIndex = groups.indexOf(group);
            return (
              <div
                key={originalIndex}
                className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 space-y-4 bg-gray-50 dark:bg-white/[0.03]"
              >
                {/* Header: Group Label + Checkbox + Eye Icon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-600">
                    <BiUser />
                    <span>Group: {group.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={checkedGroups[group.id] || false}
                      onChange={(checked: boolean) => toggleCheckGroup(group.id, checked)}
                    />
                    <button
                      onClick={() => toggleExpand(originalIndex)}
                      className="text-gray-500 hover:text-gray-700 text-md mx-1"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>

                {/* Group Summary Fields */}
                <div className="space-y-3 grid grid-cols-2 gap-2">
                  <Input placeholder="Group Name" value={group.name} readonly />
                  <Input value={group.users.length} readonly className="text-sm h-9 w-full text-center" />
                </div>

                {/* Expanded: Subtable */}
                {expandedGroup === originalIndex && (
                  <div className="mt-4 space-y-2 bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Group Members:
                    </div>
                    {group.users.map((user, uIndex) => (
                      <div
                        key={uIndex}
                        className="p-2 rounded border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-white/[0.02] space-y-1 text-sm"
                      >
                        <h4 className="text-sm text-gray-500 mt-2">User # {uIndex + 1}</h4>
                        <div className="grid grid-cols-1 gap-1">
                          <div>
                            <Label className="text-sm pt-2 pb-0 mb-1 px-1">Name</Label>
                            <Input className="font-medium text-md" value={user.name} type="text" readonly />
                          </div>
                          <div>
                            <Label className="text-sm pt-2 pb-0 mb-1 px-1">Email</Label>
                            <Input className="font-medium text-md" value={user.email} type="text" readonly />
                          </div>
                          <div>
                            <Label className="text-sm pt-2 pb-0 mb-1 px-1">Position</Label>
                            <Input className="font-medium text-md" value={user.position} type="text" readonly />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // DESKTOP: Table style
        <div className="overflow-x-auto">
          <Table className="min-w-[800px] border border-gray-300 dark:border-gray-700 text-sm">
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader className="px-2 py-2 text-center text-gray-500 font-medium">#</TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-gray-500 font-medium">Group Name</TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-gray-500 font-medium">Group Member</TableCell>
              <TableCell isHeader className="px-4 py-3 text-center text-gray-500 font-medium">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => {
              const originalIndex = groups.indexOf(group);
              return (
                <React.Fragment key={originalIndex}>
                  <TableRow className="border-b border-gray-200 dark:border-gray-700">
                    <TableCell className="py-2 text-center w-20 px-8">
                      <Checkbox
                        checked={checkedGroups[group.id] || false}
                        onChange={(checked: boolean) => toggleCheckGroup(group.id, checked)}
                        className=""
                      />
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <Input value={group.name} readonly className="text-sm h-9 w-full text-center" />
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <Input value={group.member} readonly className="text-sm h-9 w-full text-center" />
                    </TableCell>
                    <TableCell className="px-4 py-2 text-center">
                      <Button
                        size="xs"
                        variant="primary"
                        className="px-2 py-2"
                        onClick={() => setExpandedRow(expandedRow === originalIndex ? null : originalIndex)}
                      >
                        <FaEye />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === originalIndex && (
                    <TableRow className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden w-[30rem] m-2 ml-5">
                        <Table className="w-full text-sm">
                          <TableHeader>
                            <TableRow className="bg-gray-200 dark:bg-gray-800 text-center dark:text-gray-600">
                              <TableCell className="px-2 py-2">#</TableCell>
                              <TableCell className="px-2 py-2">Name</TableCell>
                              <TableCell className="px-2 py-2">Email</TableCell>
                              <TableCell className="px-2 py-2">Position</TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.users.map((user, uIndex) => (
                              <TableRow key={uIndex} className="text-center dark:text-gray-400">
                                <TableCell className="px-2 py-2">{uIndex + 1}</TableCell>
                                <TableCell className="px-2 py-2">{user.name}</TableCell>
                                <TableCell className="px-2 py-2">{user.email}</TableCell>
                                <TableCell className="px-2 py-2">{user.position}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
        </div>
      )}

      <h4 className="dark:text-gray-400"><li>Phising Material</li></h4>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Difficulty:
            </label>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Easy OR Moderate
              <FaAngleDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort:
            </label>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Popularity (Most to Least)
              <FaAngleDown className="w-4 h-4" />
            </Button>
          </div> */}
          <div className="w-full sm:w-64">
            <Input placeholder="Type the name of a phish" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phishingMaterials.map((item, idx) => (
            <SelectableCard
              key={idx}
              selected={selectedIndexesPhisingMaterial.includes(idx)}
              onSelect={() => toggleSelectCardPhisingMaterial(idx)}
            >
              <Card key={idx} className="relative border-gray-300 dark:border-gray-700">
                <CardContent className="p-0">
                  {/* Labels */}
                  <div className="flex justify-between p-2">
                    <Badge className="bg-blue-600 text-white text-xs">
                      Interaction Rate: {item.interactionRate}%
                    </Badge>
                    <Badge className="bg-gray-700 text-white text-xs">
                      Payload: {item.payload}
                    </Badge>
                  </div>

                  {/* Image preview */}
                  <div className="h-[300px] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
                    {/* Replace with actual image or fallback text */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-contain h-full w-full"
                    />
                  </div>

                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-500 dark:text-gray-400">
                    {item.title}
                  </div>
                </CardContent>
              </Card>
            </SelectableCard>
          ))}
        </div>
      </div>

      <h4 className="dark:text-gray-400"><li>Training Module</li></h4>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Difficulty:
            </label>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Easy OR Moderate
              <FaAngleDown className="w-4 h-4" />
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort:
            </label>
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Popularity (Most to Least)
              <FaAngleDown className="w-4 h-4" />
            </Button>
          </div> */}
          <div className="w-full sm:w-64">
            <Input placeholder="Type the name of a training" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingModules.map((item, idx) => (
            <SelectableCard
              key={idx}
              selected={selectedIndexesTrainingModule.includes(idx)}
              onSelect={() => toggleSelectCardTrainingModule(idx)
              }
            >
              <Card key={idx} className="relative border-gray-300 dark:border-gray-700">
                <CardContent className="p-0">
                  {/* Labels */}
                  <div className="flex justify-between p-2">
                    <Badge className="bg-blue-600 text-white text-xs">
                      {item.title}
                    </Badge>
                    <Badge className="bg-gray-700 text-white text-xs">
                      Level: {item.skillLevel}
                    </Badge>
                  </div>

                  {/* Image preview */}
                  <div className="h-[300px] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
                    {/* Replace with actual image or fallback text */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-contain h-full w-full"
                    />
                  </div>

                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-sm text-center text-gray-500 dark:text-gray-400">
                    Est. {item.timeEstimate}
                  </div>
                </CardContent>
              </Card>
            </SelectableCard>
          ))}
        </div>
      </div>

      <div className="flex border rounded shadow-sm overflow-hidden bg-white dark:bg-gray-800 dark:border-gray-600">
        <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm gap-1">
          Send Test Email
        </div>
        <input
          type="text"
          placeholder="example@gmail.com"
          className="flex-1 px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        />
        <Button className="rounded-tr-sm rounded-br-xs rounded-tl-none rounded-bl-none">Send</Button>
      </div>
    </div>
  );
}