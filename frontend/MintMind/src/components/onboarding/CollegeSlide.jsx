import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import collegeData from "@/data/us_institutions.json";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CollegeSlide = ({ onNext, onPrev, onDataUpdate, data }) => {
  const [isCollegeStudent, setIsCollegeStudent] = useState(
    data.isCollegeStudent
  );
  const [college, setCollege] = useState(data.college);
  const [searchTerm, setSearchTerm] = useState(data.college || "");
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 0) {
        const filtered = collegeData
          .filter((item) =>
            item.institution.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 10); // Limit to 10 results
        setFilteredColleges(filtered);
        setShowDropdown(true);
      } else {
        setFilteredColleges([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStudentResponse = (response) => {
    setIsCollegeStudent(response);
    if (!response) {
      setCollege("");
      setSearchTerm("");
      onDataUpdate({ isCollegeStudent: response, college: "" });
    } else {
      onDataUpdate({ isCollegeStudent: response });
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCollege(value);
    onDataUpdate({ college: value });
  };

  const handleCollegeSelect = (selectedCollege) => {
    setCollege(selectedCollege);
    setSearchTerm(selectedCollege);
    setShowDropdown(false);
    onDataUpdate({ college: selectedCollege });
  };

  const canContinue =
    isCollegeStudent !== null && (isCollegeStudent === false || college !== "");

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Are you a college student?
        </CardTitle>
        <p className="text-gray-600">
          This helps us tailor your budgeting experience
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleStudentResponse(true)}
              variant={isCollegeStudent === true ? "default" : "outline"}
              className={`h-12 transition-all duration-200 ${
                isCollegeStudent === true
                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              Yes
            </Button>
            <Button
              onClick={() => handleStudentResponse(false)}
              variant={isCollegeStudent === false ? "default" : "outline"}
              className={`h-12 transition-all duration-200 ${
                isCollegeStudent === false
                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              No
            </Button>
          </div>

          {isCollegeStudent === true && (
            <div
              className="space-y-2 animate-fade-in relative"
              ref={dropdownRef}
            >
              <Label
                htmlFor="college"
                className="text-sm font-medium text-gray-700"
              >
                Which college do you attend?
              </Label>
              <Input
                id="college"
                type="text"
                placeholder="Start typing your college name..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-12 border-gray-200 focus:border-sky-500 focus:ring-sky-500"
                onFocus={() => {
                  if (filteredColleges.length > 0) {
                    setShowDropdown(true);
                  }
                }}
              />

              {showDropdown && filteredColleges.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {filteredColleges.map((collegeItem, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleCollegeSelect(collegeItem.institution)
                      }
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-800">
                        {collegeItem.institution}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onPrev}
            variant="outline"
            className="flex-1 h-12 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!canContinue}
            className="flex-1 h-12 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollegeSlide;
