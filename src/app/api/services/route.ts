import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/Service";

const DEFAULT_SERVICES = [
  {
    title: "පෞද්ගලික කේන්දර පරීක්ෂාව",
    description: "ඔබේ ජීවන ගමන් මග, ශක්තීන්, අභියෝග සහ අනාගත අවස්ථාවන් අනාවරණය කර ගැනීම සඳහා ඔබේ කේන්දරය පිළිබඳ පුළුල් විශ්ලේෂණයක්.",
    price: "රු. 3000",
    duration: "විනාඩි 60",
    iconName: "Star"
  },
  {
    title: "පොරොන්දම් ගැලපීම",
    description: "සාමකාමී, දිගුකාලීන සහ සමෘද්ධිමත් විවාහ ජීවිතයක් සහතික කිරීම සඳහා සහකරුවන් අතර ගැළපීම පිළිබඳ ගැඹුරු විශ්ලේෂණයක්.",
    price: "රු. 4500",
    duration: "විනාඩි 90",
    iconName: "Heart"
  },
  {
    title: "නාමකරණය සහ අංක විද්‍යාව",
    description: "ඔබේ නමේ සැඟවුණු බලපෑම සහ උපරිම සාර්ථකත්වය සඳහා ඔබේ උපන් දිනය සමඟ එය පරිපූර්ණ ලෙස පෙළගස්වන්නේ කෙසේදැයි සොයා ගන්න.",
    price: "රු. 2500",
    duration: "විනාඩි 45",
    iconName: "Book"
  },
  {
    title: "වාර්ෂික පලාපල",
    description: "රැකියාව, ආදරය, සෞඛ්‍යය සහ ධනය සම්බන්ධයෙන් ඉදිරි වසරේ මාසෙන් මාසයට ඔබට ලැබෙන්නේ කුමක්ද යන්න පිළිබඳව.",
    price: "රු. 4000",
    duration: "විනාඩි 60",
    iconName: "Sparkles"
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';

    await connectToDatabase();
    
    // If not fetching all, only fetch where isActive is not false (so true or undefined)
    const query = fetchAll ? {} : { isActive: { $ne: false } };
    
    let services = await Service.find(query).sort({ createdAt: 1 });
    
    if (services.length === 0 && !fetchAll) {
      // Seed default services
      const allServices = await Service.find().sort({ createdAt: 1 });
      if (allServices.length === 0) {
        await Service.insertMany(DEFAULT_SERVICES);
        services = await Service.find(query).sort({ createdAt: 1 });
      }
    }
    
    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error("Fetch services error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
