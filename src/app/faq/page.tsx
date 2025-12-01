
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'FAQ - SenseMapper',
  description: 'Frequently Asked Questions about the SenseMapper application.',
};

const EditorFAQ = () => (
  <div className="space-y-12">
    <h1 className="text-4xl font-bold text-center">
      SensoryMapper Frequently Asked Questions
    </h1>

    <section id="general">
      <h2 className="text-2xl font-semibold border-b pb-2 mb-4">General</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">What is SensoryMapper?</h3>
          <p className="text-muted-foreground">
            SensoryMapper is a web app that helps you create sensory maps for buildings. You can upload a floor plan and add details about sights, sounds, smells, and practical amenities. This helps people navigate spaces more comfortably.
          </p>
        </div>
        <div>
            <h3 className="text-lg font-semibold">What is a sensory map?</h3>
            <p className="text-muted-foreground">
                A sensory map shows you the layout of a building along with important sensory details. It highlights areas that might be loud, bright, smelly, or crowded. It also shows you where to find practical facilities.
            </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Who is it for?</h3>
          <p className="text-muted-foreground">
            Building managers, schools, and event planners use it to make their spaces more inclusive.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Is SensoryMapper free?</h3>
          <p className="text-muted-foreground">
            Yes, it is currently free.
          </p>
        </div>
      </div>
    </section>

    <section id="creating">
      <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Creating & Editing Maps</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">How do I start?</h3>
          <p className="text-muted-foreground">
            Click the <strong>Upload Floor Plan</strong> button on the home page. Upload a PNG or JPG image of your layout. Then, you can add markers and shapes.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">What information can I add?</h3>
          <p className="text-muted-foreground">You can add two main types of details:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Sensory Inputs:</strong> Mark loud noises, strong smells, bright lights, or crowds. You can set the intensity to Low, Medium, or High.</li>
            <li><strong>Amenities:</strong> Mark quiet rooms, toilets, exits, seating, and first aid.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Can I add my own photos?</h3>
          <p className="text-muted-foreground">
            Yes. You can upload a photo to any marker. This is great for showing what a quiet room or visual landmark looks like.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Can I add audio?</h3>
           <p className="text-muted-foreground">
             Yes. You can upload audio files to capture the sounds of an area or add verbal notes.
           </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">How do I save my work?</h3>
          <p className="text-muted-foreground">
            Click the <strong>Share</strong> button to save your map. This creates a unique link to your current layout.
          </p>
        </div>
      </div>
    </section>

    <section id="sharing">
      <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Sharing & Exporting</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">How do I share my map?</h3>
          <p className="text-muted-foreground">
            Click the <strong>Share</strong> button. Copy the link and send it to anyone. They will see a read-only version of your map.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Can people edit my shared map?</h3>
          <p className="text-muted-foreground">
            No. The link gives them "View Only" access. They can see your notes and photos, but they cannot change them.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Can I print my map?</h3>
          <p className="text-muted-foreground">
            Yes. Click <strong>Export</strong>. You can choose the page orientation and icon size. Then click <strong>Print to PDF</strong> to get a printable version with a key.
          </p>
        </div>
      </div>
    </section>

    <section id="troubleshooting">
      <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Troubleshooting</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">My floor plan image isn't loading.</h3>
          <p className="text-muted-foreground">
            Make sure your file is a PNG or JPG. If the file is large, try making it smaller before you upload it.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">I can't hear the audio on a shared map.</h3>
          <p className="text-muted-foreground">
            Check your volume settings. Also, check that the audio file finished uploading when you created the map.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">The icons on my printed map are the wrong size.</h3>
          <p className="text-muted-foreground">
            Use the <strong>Icon Scale</strong> slider in the Export menu to change the icon size before you click <strong>Print to PDF</strong>.
          </p>
        </div>
      </div>
    </section>
  </div>
);

const ViewerFAQ = () => (
    <div className="space-y-12">
        <h1 className="text-4xl font-bold text-center">
            Frequently Asked Questions for Visitors
        </h1>

        <section id="general">
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">General</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Who is this map for?</h3>
                    <p className="text-muted-foreground">
                        This map is for anyone visiting the building. It is especially helpful for people with sensory sensitivities who want to know what to expect before they arrive. It helps you find quiet spaces and plan a comfortable visit.
                    </p>
                </div>
            </div>
        </section>

        <section id="using">
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Using the Map</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">How do I read the map?</h3>
                    <p className="text-muted-foreground">
                        Look for the icons placed on the floor plan. You can click or tap on any icon to see more details.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">What do the icons mean?</h3>
                    <p className="text-muted-foreground">
                        There are two main types of icons:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li><strong>Sensory Inputs:</strong> These show specific sensory experiences. You might see icons for loud noises, strong smells, bright lights, or crowded areas. The notes will tell you if the intensity is Low, Medium, or High.</li>
                        <li><strong>Amenities:</strong> These show helpful facilities. Look for these icons to find quiet rooms, toilets, exits, seating areas, and first aid points.</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Why are there photos?</h3>
                    <p className="text-muted-foreground">
                        Some icons include photos when you click on them. These photos help you see exactly what a specific area, quiet room, or landmark looks like so you can recognise it when you arrive.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Why is there audio?</h3>
                    <p className="text-muted-foreground">
                        If you see an audio option on a marker, you can play it to hear what that specific area sounds like. This helps you prepare for the noise levels in that part of the building.
                    </p>
                </div>
            </div>
        </section>

        <section id="sharing">
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Sharing and Printing</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">Can I print this map?</h3>
                    <p className="text-muted-foreground">
                        Yes. Look for the <strong>Export</strong> button. You can choose how you want the page to look and then click <strong>Print to PDF</strong>. This will give you a printable version that includes a key to explain the icons.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Can I share this map with others?</h3>
                    <p className="text-muted-foreground">
                        Yes. You can copy the web address (URL) from your browser and send it to anyone. They will be able to view the same map you are looking at.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Can I change the map?</h3>
                    <p className="text-muted-foreground">
                        No. As a visitor, you have "View Only" access. You can see all the notes, photos, and icons, but you cannot move or delete them.
                    </p>
                </div>
            </div>
        </section>

        <section id="troubleshooting">
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Troubleshooting</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold">I cannot hear the audio.</h3>
                    <p className="text-muted-foreground">
                        Please check the volume settings on your device (computer or phone). If the volume is up and you still cannot hear it, the audio file may not be available for that specific marker.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">The map is hard to read.</h3>
                    <p className="text-muted-foreground">
                        You can try zooming in on the image to see more detail. If you are printing the map, try using the <strong>Icon Scale</strong> slider in the Export menu to make the icons larger before printing.
                    </p>
                </div>
            </div>
        </section>
    </div>
);


type FAQPageProps = {
    searchParams?: {
        view?: string;
        back?: string;
    };
};

export default function FAQPage({ searchParams }: FAQPageProps) {
  const isReadOnly = searchParams?.view === 'readonly';
  const backUrl = searchParams?.back;
  
  // Use the 'back' parameter if it exists, otherwise use history.back() for read-only, or '/' for editor.
  const backLink = backUrl ? backUrl : (isReadOnly ? 'javascript:history.back()' : '/');

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Button asChild variant="outline" size="sm">
          <Link href={backLink}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Map
          </Link>
        </Button>
      </header>
      <main className="container mx-auto max-w-3xl py-8 px-4">
        {isReadOnly ? <ViewerFAQ /> : <EditorFAQ />}
      </main>
    </div>
  );
}
