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
    <div className="relative overflow-hidden">
      {/* Floating background particles */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-6 left-10 w-3 h-3 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.3s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-28 right-6 w-2 h-2 bg-gradient-to-r from-cyan-400/30 to-emerald-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1.8s", animationDuration: "3.5s" }}
        />
        <div
          className="absolute bottom-20 left-12 w-4 h-4 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 rounded-full animate-pulse"
          style={{ animationDelay: "2.2s", animationDuration: "4.5s" }}
        />
        <div
          className="absolute bottom-8 right-8 w-3 h-3 bg-gradient-to-r from-cyan-400/25 to-emerald-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "0.7s", animationDuration: "3.8s" }}
        />
      </div>

      <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-700 ease-out transform hover:bg-white/10 animate-in fade-in duration-500">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-emerald-900/10 pointer-events-none" />

        <CardHeader className="text-center space-y-4 pt-6 pb-4 relative">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-white leading-relaxed">
              Are you a college student?
            </CardTitle>
            <p className="text-slate-300 text-base font-medium">
              This helps us tailor your budgeting experience
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-6 relative">
          <div className="space-y-4">
            {/* Enhanced Yes/No buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleStudentResponse(true)}
                variant={isCollegeStudent === true ? "default" : "outline"}
                className={`h-12 transition-all duration-300 rounded-2xl font-semibold text-lg shadow-sm hover:shadow-md ${
                  isCollegeStudent === true
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg border-0 transform scale-[1.02]"
                    : "border border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 text-slate-300 hover:text-white bg-transparent"
                }`}
              >
                Yes
              </Button>
              <Button
                onClick={() => handleStudentResponse(false)}
                variant={isCollegeStudent === false ? "default" : "outline"}
                className={`h-12 transition-all duration-300 rounded-2xl font-semibold text-lg shadow-sm hover:shadow-md ${
                  isCollegeStudent === false
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg border-0 transform scale-[1.02]"
                    : "border border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 text-slate-300 hover:text-white bg-transparent"
                }`}
              >
                No
              </Button>
            </div>

            {/* Enhanced college search */}
            {isCollegeStudent === true && (
              <div
                className="space-y-3 animate-in slide-in-from-top duration-500 relative"
                ref={dropdownRef}
              >
                <Label
                  htmlFor="college"
                  className="text-base font-semibold text-slate-200 text-center block"
                >
                  Which college do you attend?
                </Label>

                <div className="relative">
                  <Input
                    id="college"
                    type="text"
                    placeholder="Start typing your college name..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-12 px-4 border border-white/20 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 text-base rounded-2xl bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md text-white placeholder:text-slate-400"
                    onFocus={() => {
                      if (filteredColleges.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                  />
                </div>

                {showDropdown && filteredColleges.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-lg border border-emerald-400/20 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top duration-300">
                    {filteredColleges.map((collegeItem, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleCollegeSelect(collegeItem.institution)
                        }
                        className="w-full text-left px-6 py-4 hover:bg-emerald-400/10 border-b border-slate-700 last:border-b-0 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <div className="font-semibold text-slate-200 hover:text-white">
                          {collegeItem.institution}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onPrev}
              variant="outline"
              className="flex-1 h-12 border border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 transition-all duration-300 rounded-2xl font-semibold text-slate-300 hover:text-white shadow-sm hover:shadow-md bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!canContinue}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none rounded-2xl shadow-lg"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeSlide;
