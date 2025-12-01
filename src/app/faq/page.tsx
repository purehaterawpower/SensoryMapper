import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        Sensory Map Viewer FAQ
      </h1>
  
      <section id="general">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Viewing a Map</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">What am I looking at?</h3>
            <p className="text-muted-foreground">
              You are viewing a sensory map. It shows a floor plan with information about sensory inputs (like sounds and smells) and facilities (like quiet rooms and toilets) to help people navigate the space more comfortably.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">How do I see details?</h3>
            <p className="text-muted-foreground">
              Click on any icon on the map. A pop-up window will appear with more details, including a description, photos, and audio notes if they have been added.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">What do the colors and icons mean?</h3>
            <p className="text-muted-foreground">
              Use the <strong>Map Key</strong> in the sidebar to see what each icon and color represents. You can also hide or show different categories by using the checkboxes in the key.
            </p>
          </div>
        </div>
      </section>
  
      <section id="sharing">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Sharing & Using the Map</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Can I edit this map?</h3>
            <p className="text-muted-foreground">
              No. This is a "View Only" link. You can look at all the information, but you cannot make any changes.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">How can I create my own map?</h3>
            <p className="text-muted-foreground">
              To create your own sensory map, go to the <Link href="/" className="text-primary underline">SenseMapper home page</Link>.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Can I print this map?</h3>
            <p className="text-muted-foreground">
              Printing is a feature available to the map creator. If you need a printable version, please contact the person who shared this link with you.
            </p>
          </div>
        </div>
      </section>
  
      <section id="troubleshooting">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Troubleshooting</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">The map is not loading correctly.</h3>
            <p className="text-muted-foreground">
              Try refreshing the page. If that doesn't work, there might be an issue with the shared link. Please check with the person who sent it to you.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">I can't hear the audio on a marker.</h3>
            <p className="text-muted-foreground">
              First, check your device's volume. If it's turned up, the audio may not have been included or uploaded correctly by the map creator.
            </p>
          </div>
        </div>
      </section>
    </div>
);


type FAQPageProps = {
    searchParams?: {
        view?: string;
    };
};

export default function FAQPage({ searchParams }: FAQPageProps) {
  const isReadOnly = searchParams?.view === 'readonly';
  const backLink = isReadOnly ? 'javascript:history.back()' : '/';

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
