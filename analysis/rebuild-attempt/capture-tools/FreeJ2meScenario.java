import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Deterministic, bounded FreeJ2ME startup scenario; output only in a new output directory. */
public final class FreeJ2meScenario {
    private static void snap(MobilePlatform p, File dir, String name) throws Exception {
        File out = new File(dir, name + ".png");
        if (out.exists()) throw new IllegalStateException("refusing overwrite: " + out);
        ImageIO.write(p.getLCD(), "png", out);
        System.out.println("frame " + name + " " + p.getLCD().getWidth() + "x" + p.getLCD().getHeight());
    }
    private static void tap(MobilePlatform p, int key) throws Exception {
        p.keyPressed(key); Thread.sleep(200L); p.keyReleased(key); Thread.sleep(2500L);
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) { System.err.println("usage: FreeJ2meScenario <midlet.jar> <new-output-dir>"); System.exit(2); }
        File output = new File(args[1]);
        if (!output.mkdir()) throw new IllegalStateException("output must be a new directory: " + output);
        MobilePlatform p = new MobilePlatform(240, 320); Mobile.setPlatform(p);
        p.setPainter(new Runnable() { public void run() { } });
        System.out.println("loadJar=" + p.loadJar(new File(args[0]).toURI().toURL().toString()));
        p.runJar();
        Thread.sleep(3000L); snap(p, output, "01-splash");
        Thread.sleep(3000L); snap(p, output, "02-language");
        tap(p, Mobile.KEY_NUM5); snap(p, output, "03-after-language");
        tap(p, Mobile.KEY_NUM5); snap(p, output, "04-after-music-choice");
        tap(p, Mobile.KEY_NUM5); snap(p, output, "05-after-next");
        System.exit(0);
    }
}
