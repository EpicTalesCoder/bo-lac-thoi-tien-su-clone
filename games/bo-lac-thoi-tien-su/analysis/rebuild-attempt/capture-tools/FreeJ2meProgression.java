import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Bounded opening-flow test. Saves one screenshot per screen and uses only Fire presses. */
public final class FreeJ2meProgression {
    private static void capture(MobilePlatform p, File dir, String name) throws Exception {
        File out = new File(dir, name + ".png");
        if (out.exists()) throw new IllegalStateException("refusing overwrite: " + out);
        ImageIO.write(p.getLCD(), "png", out);
        System.out.println(name + " captured");
    }
    private static void fire(MobilePlatform p) throws Exception {
        p.keyPressed(Mobile.KEY_NUM5); Thread.sleep(180L); p.keyReleased(Mobile.KEY_NUM5); Thread.sleep(2200L);
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) { System.err.println("usage: FreeJ2meProgression <jar> <new-output-dir>"); System.exit(2); }
        File dir=new File(args[1]); if(!dir.mkdir()) throw new IllegalStateException("new output directory required: "+dir);
        MobilePlatform p=new MobilePlatform(240,320); Mobile.setPlatform(p); p.setPainter(new Runnable(){public void run(){}});
        System.out.println("loadJar="+p.loadJar(new File(args[0]).toURI().toURL().toString())); p.runJar();
        Thread.sleep(3000L); capture(p,dir,"00-splash");
        Thread.sleep(3000L); capture(p,dir,"01-language");
        // Mouse tap on the visible green confirm mark at lower-left of the 240x320 canvas.
        for(int i=2;i<=9;i++){
            p.pointerPressed(10,311); Thread.sleep(160L); p.pointerReleased(10,311);
            Thread.sleep(2500L); capture(p,dir,String.format("%02d-step",i));
        }
        System.exit(0);
    }
}
