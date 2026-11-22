import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Bounded headless FreeJ2ME smoke capture; writes only to the supplied output path. */
public final class FreeJ2meCapture {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("usage: FreeJ2meCapture <midlet.jar> <frame.png>");
            System.exit(2);
        }
        MobilePlatform platform = new MobilePlatform(240, 320);
        Mobile.setPlatform(platform);
        String jarUrl = new File(args[0]).toURI().toURL().toString();
        System.out.println("loadJar=" + platform.loadJar(jarUrl));
        platform.setPainter(new Runnable() {
            public void run() { }
        });
        platform.runJar();
        Thread.sleep(4000L);
        boolean written = ImageIO.write(platform.getLCD(), "png", new File(args[1]));
        System.out.println("frameWritten=" + written + " size=" + platform.getLCD().getWidth() + "x" + platform.getLCD().getHeight());
        // Try a neutral/fire key interaction after preserving the initial frame.
        platform.keyPressed(Mobile.KEY_NUM5);
        Thread.sleep(500L);
        platform.keyReleased(Mobile.KEY_NUM5);
        Thread.sleep(500L);
        System.exit(0);
    }
}
