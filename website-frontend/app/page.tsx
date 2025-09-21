import Link from "next/link";
import { ArrowRight, Users, Calendar, BookOpen, Award, User, Camera } from "lucide-react";
import { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">  
      {/* Hero Section */}
      <section className="relative 
        min-h-[calc(100svh-var(--header-h))] 
        md:min-h-[calc(100vh-var(--header-h))] 
        flex items-center justify-center 
        bg-gradient-to-br from-blue-900 via-blue-700 to-teal-600">

        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            NCSSM TSA
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90">
            Empowering students through technology, innovation, and competition
            at the North Carolina School of Science and Mathematics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              Explore Events <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Meet the Officers Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet the Officers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* President */}
            <div className="text-center">
              <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Muhilian Krishnan
              </h3>
              <p className="text-base font-medium text-blue-600 mb-2">
                President
              </p>
              <p className="text-sm text-gray-600">
                krishnan26m@ncssm.edu
              </p>
            </div>

            {/* Vice President */}
            <div className="text-center">
              <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Aaditya Sah
              </h3>
              <p className="text-base font-medium text-blue-600 mb-2">
                Vice President
              </p>
              <p className="text-sm text-gray-600">
                sah26a@ncssm.edu
              </p>
            </div>

            {/* Secretary */}
            <div className="text-center">
              <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Kerry Luo
              </h3>
              <p className="text-base font-medium text-blue-600 mb-2">
                Secretary
              </p>
              <p className="text-sm text-gray-600">
                luo26k@ncssm.edu
              </p>
            </div>

            {/* Treasurer */}
            <div className="text-center">
              <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Hasita Alluri
              </h3>
              <p className="text-base font-medium text-blue-600 mb-2">
                Treasurer
              </p>
              <p className="text-sm text-gray-600">
                alluri26h@ncssm.edu
              </p>
            </div>

            {/* Reporter */}
            <div className="text-center">
              <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Lily Galapon
              </h3>
              <p className="text-base font-medium text-blue-600 mb-2">
                Reporter
              </p>
              <p className="text-sm text-gray-600">
                galapon26l@ncssm.edu
              </p>
            </div>

            {/* Sergeant at Arms */}
            <div className="text-center">
              <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                James Nguyen
              </h3>
              <p className="text-base font-medium text-blue-600 mb-2">
                Sergeant at Arms
              </p>
              <p className="text-sm text-gray-600">
                nguyen26j@ncssm.edu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Our Journey in Photos</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              See the innovation, teamwork, and achievements that define our chapter
            </p>
          </div>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {/* Photo 1 */}
            <div className="group relative overflow-hidden rounded-xl aspect-square">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Camera className="h-16 w-16 text-white/80" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">State Competition</h3>
                  <p className="text-sm text-blue-200">2024</p>
                </div>
              </div>
            </div>

            {/* Photo 2 */}
            <div className="group relative overflow-hidden rounded-xl aspect-square">
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Camera className="h-16 w-16 text-white/80" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Robotics Workshop</h3>
                  <p className="text-sm text-green-200">2024</p>
                </div>
              </div>
            </div>

            {/* Photo 3 */}
            <div className="group relative overflow-hidden rounded-xl aspect-square">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Camera className="h-16 w-16 text-white/80" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Team Building</h3>
                  <p className="text-sm text-purple-200">2024</p>
                </div>
              </div>
            </div>

            {/* Photo 4 */}
            <div className="group relative overflow-hidden rounded-xl aspect-square">
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Camera className="h-16 w-16 text-white/80" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Awards Ceremony</h3>
                  <p className="text-sm text-yellow-200">2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Camera className="h-6 w-6 mr-3" />
              All Photos
              <ArrowRight className="h-5 w-5 ml-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
