import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import javax.imageio.ImageIO;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/**
 * Runs a bounded original-JAR campaign path, then exports the live first-map
 * terrain grid and source-defined sprite tables without invoking a game tick.
 */
public final class FreeJ2meCampaignStateDump {
    private static Field findField(Class<?> type, String name) throws Exception {
        Class<?> current = type;
        while (current != null) {
            try { return current.getDeclaredField(name); }
            catch (NoSuchFieldException absentHere) { current = current.getSuperclass(); }
        }
        throw new NoSuchFieldException(type.getName() + "." + name);
    }
    private static Object field(Object target, String name) throws Exception {
        Field f = findField(target.getClass(), name); f.setAccessible(true); return f.get(target);
    }
    private static void fire(MobilePlatform p) throws Exception {
        p.keyPressed(Mobile.KEY_NUM5); Thread.sleep(140L); p.keyReleased(Mobile.KEY_NUM5); Thread.sleep(2400L);
    }
    private static void writeString(Writer w, String s) throws Exception {
        w.write('"');
        for (int i=0;i<s.length();i++) {
            char c=s.charAt(i);
            if(c=='"'||c=='\\'){w.write('\\');w.write(c);} else if(c=='\n')w.write("\\n"); else if(c=='\r')w.write("\\r"); else if(c=='\t')w.write("\\t"); else if(c<32)w.write(String.format("\\u%04x",(int)c)); else w.write(c);
        }
        w.write('"');
    }
    private static void json(Writer w, Object value) throws Exception {
        if (value == null) { w.write("null"); return; }
        Class<?> c=value.getClass();
        if(c.isArray()) {
            w.write('['); int n=java.lang.reflect.Array.getLength(value);
            for(int i=0;i<n;i++){if(i>0)w.write(',');json(w,java.lang.reflect.Array.get(value,i));}
            w.write(']'); return;
        }
        if(value instanceof Number || value instanceof Boolean){w.write(value.toString());return;}
        writeString(w,value.toString());
    }
    private static void prop(Writer w,String name,Object value,boolean last)throws Exception{writeString(w,name);w.write(':');json(w,value);if(!last)w.write(',');}
    public static void main(String[] args) throws Exception {
        if(args.length!=2)throw new IllegalArgumentException("usage: FreeJ2meCampaignStateDump <original.jar> <new-output-dir>");
        File dir=new File(args[1]);if(!dir.mkdirs())throw new IllegalStateException("output directory must be new");
        MobilePlatform p=new MobilePlatform(240,320);Mobile.setPlatform(p);p.setPainter(new Runnable(){public void run(){}});
        System.out.println("loadJar="+p.loadJar(new File(args[0]).toURI().toURL().toString()));p.runJar();Thread.sleep(6500L);
        for(int i=0;i<3;i++)fire(p); // language -> music -> main menu -> mode menu
        fire(p); // select campaign, open continue/new-game menu
        p.keyPressed(Mobile.KEY_NUM8);Thread.sleep(140L);p.keyReleased(Mobile.KEY_NUM8);Thread.sleep(2400L); // choose New Game
        fire(p); // confirm destructive new-game prompt
        for(int i=0;i<19;i++)fire(p); // advance prompts/story to first map
        Object canvas=Mobile.getDisplay().getCurrent();
        System.out.println("currentCanvas=" + canvas.getClass().getName());
        ImageIO.write(p.getLCD(), "png", new File(dir, "live-current.png"));
        java.lang.reflect.Method stateMethod=canvas.getClass().getDeclaredMethod("aN");
        stateMethod.setAccessible(true); stateMethod.invoke(canvas);
        int screen=((Number)field(canvas,"var_byte_v")).intValue();
        int level=((Number)field(canvas,"var_byte_q")).intValue();
        int width=((Number)field(canvas,"var_short_c")).intValue();
        int height=((Number)field(canvas,"var_short_d")).intValue();
        byte[][] terrain=(byte[][])field(canvas,"var_byte_arr_arr_b");
        byte[][] occupancy=(byte[][])field(canvas,"var_byte_arr_arr_c");
        byte[] entity=(byte[])field(canvas,"var_byte_arr_e");
        File out=new File(dir,"first-map-state.json");
        try(Writer w=new OutputStreamWriter(new FileOutputStream(out),StandardCharsets.UTF_8)){
            w.write('{');prop(w,"sourceCanvas",canvas.getClass().getName(),false);prop(w,"screenState",screen,false);prop(w,"scenarioIndex",level,false);prop(w,"mapWidth",width,false);prop(w,"mapHeight",height,false);
            prop(w,"cameraX",field(canvas,"var_byte_I"),false);prop(w,"cameraY",field(canvas,"var_byte_K"),false);prop(w,"cursorX",field(canvas,"var_byte_y"),false);prop(w,"cursorY",field(canvas,"var_byte_A"),false);
            w.write("\"terrain\":[");for(int y=0;y<height;y++){if(y>0)w.write(',');w.write('[');for(int x=0;x<width;x++){if(x>0)w.write(',');w.write(Integer.toString(terrain[y][x]&255));}w.write(']');}w.write("],");
            w.write("\"occupancy\":[");for(int y=0;y<height;y++){if(y>0)w.write(',');w.write('[');for(int x=0;x<width;x++){if(x>0)w.write(',');w.write(Integer.toString(occupancy[y][x]));}w.write(']');}w.write("],");
            w.write("\"entities\":[");boolean first=true;for(int id=1;id<=100;id++){int active=entity[1919+id]&255;if(active==0)continue;if(!first)w.write(',');first=false;w.write('{');prop(w,"id",id,false);prop(w,"x",entity[id]&255,false);prop(w,"y",entity[101+id]&255,false);prop(w,"type",entity[606+id]&255,false);prop(w,"owner",entity[8749+id]&255,false);prop(w,"state",entity[2828+id]&255,false);prop(w,"health",active,true);w.write('}');}w.write("],");
            prop(w,"tileSpriteIndex",field(canvas,"var_short_arr_arr_b"),false);prop(w,"tileSpriteMeta",field(canvas,"var_byte_arr_arr_j"),false);prop(w,"mapOffsets",field(canvas,"var_short_arr_a"),false);prop(w,"mapPackedData",field(canvas,"var_byte_arr_a"),false);prop(w,"levelAssetOffsets",field(canvas,"var_int_arr_h"),true);w.write('}');
        }
        System.out.println("canvas="+canvas.getClass().getName()+" screen="+screen+" scenario="+level+" map="+width+"x"+height+" output="+out.getAbsolutePath());System.exit(0);
    }
}
