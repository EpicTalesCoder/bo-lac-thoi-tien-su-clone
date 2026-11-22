import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.lang.reflect.Field;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Observe decompiled candidate's named map state for web-port research only. */
public final class FreeJ2meCandidateStateProbe {
    private static Object field(Object target, String name) throws Exception {
        Class<?> c=target.getClass(); while(c!=null){try{Field f=c.getDeclaredField(name);f.setAccessible(true);return f.get(target);}catch(NoSuchFieldException e){c=c.getSuperclass();}} throw new NoSuchFieldException(name);
    }
    private static void fire(MobilePlatform p)throws Exception{p.keyPressed(Mobile.KEY_NUM5);Thread.sleep(140);p.keyReleased(Mobile.KEY_NUM5);Thread.sleep(2400);}
    private static void json(Writer w,Object value)throws Exception{
        if(value==null){w.write("null");return;}
        Class<?> c=value.getClass();
        if(c.isArray()){w.write('[');int n=java.lang.reflect.Array.getLength(value);for(int i=0;i<n;i++){if(i>0)w.write(',');json(w,java.lang.reflect.Array.get(value,i));}w.write(']');return;}
        if(value instanceof Number||value instanceof Boolean){w.write(value.toString());return;}
        String s=value.toString().replace("\\\\","\\\\\\\\").replace("\"","\\\\\"");w.write("\""+s+"\"");
    }
    private static void save(File out, Object canvas)throws Exception{
        byte[][] terrain=(byte[][])field(canvas,"var_byte_arr_arr_b"); byte[][] occupancy=(byte[][])field(canvas,"var_byte_arr_arr_c"); byte[] entity=(byte[])field(canvas,"var_byte_arr_e");
        int width=((Number)field(canvas,"var_short_c")).intValue(),height=((Number)field(canvas,"var_short_d")).intValue();
        short[][] shortTables=(short[][])field(canvas,"var_short_arr_arr_b"); byte[][] byteTables=(byte[][])field(canvas,"var_byte_arr_arr_j");
        short[][] shortSnapshot=new short[shortTables.length][]; for(int i=0;i<shortTables.length;i++) shortSnapshot[i]=shortTables[i].clone();
        byte[][] byteSnapshot=new byte[byteTables.length][]; for(int i=0;i<byteTables.length;i++) byteSnapshot[i]=byteTables[i].clone();
        try(Writer w=new OutputStreamWriter(new FileOutputStream(out),StandardCharsets.UTF_8)){
            w.write("{\"scenario\":"+field(canvas,"var_byte_q")+",\"screen\":"+field(canvas,"var_byte_v")+",\"width\":"+width+",\"height\":"+height+",\"viewportColumns\":"+field(canvas,"var_byte_O")+",\"viewportRows\":"+field(canvas,"var_byte_P")+",\"screenOriginX\":"+field(canvas,"var_short_a")+",\"screenOriginY\":"+field(canvas,"var_short_b")+",\"mapTopUi\":"+field(canvas,"bb")+",\"bottomUi\":"+field(canvas,"ba")+",\"verticalOffset\":"+field(canvas,"var_byte_ax")+",\"cursorX\":"+field(canvas,"var_byte_y")+",\"cursorY\":"+field(canvas,"var_byte_A")+",\"cameraX\":"+field(canvas,"var_byte_I")+",\"cameraY\":"+field(canvas,"var_byte_K")+",\"terrain\":[");
            for(int y=0;y<height;y++){if(y>0)w.write(',');w.write('[');for(int x=0;x<width;x++){if(x>0)w.write(',');w.write(Integer.toString(terrain[y][x]&255));}w.write(']');}w.write("],\"occupancy\":[");
            for(int y=0;y<height;y++){if(y>0)w.write(',');w.write('[');for(int x=0;x<width;x++){if(x>0)w.write(',');w.write(Integer.toString(occupancy[y][x]));}w.write(']');}w.write("],\"entities\":[");
            boolean first=true; for(int id=1;id<=100;id++){int active=entity[1919+id]&255;if(active==0)continue;if(!first)w.write(',');first=false;w.write("{\"id\":"+id+",\"x\":"+(entity[id]&255)+",\"y\":"+(entity[101+id]&255)+",\"type\":"+(entity[606+id]&255)+",\"owner\":"+(entity[8749+id]&255)+",\"state\":"+(entity[2828+id]&255)+",\"hp\":"+active+"}");}w.write("],\"shortSpriteTables\":");json(w,shortSnapshot);w.write(",\"byteSpriteTables\":");json(w,byteSnapshot);w.write(",\"imageGroupMap\":");json(w,field(canvas,"var_byte_arr_c"));w.write(",\"mapTableOffsets\":");json(w,field(canvas,"var_short_arr_a"));w.write(",\"mapTableData\":");json(w,field(canvas,"var_byte_arr_a"));w.write(",\"entityAnimationFrames\":");json(w,field(canvas,"var_byte_arr_arr_i"));w.write(",\"entityHeightOffsets\":");json(w,field(canvas,"var_byte_arr_arr_h"));w.write(",\"entityData\":");json(w,entity);w.write(",\"entityFieldOffsets\":");json(w,field(canvas,"var_short_arr_b"));w.write(",\"fogOfWar\":");json(w,field(canvas,"var_int_arr_arr_arr_a"));w.write(",\"resources\":");json(w,field(canvas,"var_short_arr_arr_a"));w.write(",\"hoverUnit\":"+field(canvas,"var_byte_W")+",\"selectedUnit\":"+field(canvas,"var_byte_k")+",\"activeGroup\":"+field(canvas,"var_byte_F")+"}");
        }
    }
    public static void main(String[]args)throws Exception{
        if(args.length!=2)throw new IllegalArgumentException("usage: FreeJ2meCandidateStateProbe <candidate.jar> <new-output-dir>");File dir=new File(args[1]);if(!dir.mkdir())throw new IllegalStateException("new directory required");
        MobilePlatform p=new MobilePlatform(240,320);Mobile.setPlatform(p);p.setPainter(new Runnable(){public void run(){}});System.out.println("loadJar="+p.loadJar(new File(args[0]).toURI().toURL().toString()));p.runJar();Thread.sleep(6500);
        for(int i=0;i<40;i++){
            Object c=Mobile.getDisplay().getCurrent();
            try{String s="step="+i+" canvas="+c.getClass().getName()+" v="+field(c,"var_byte_v")+" Q="+field(c,"var_byte_Q")+" q="+field(c,"var_byte_q")+" ai="+field(c,"var_byte_ai");System.out.println(s);if(((Byte)field(c,"var_byte_v")).byteValue()==1){Thread.sleep(3500);c=Mobile.getDisplay().getCurrent();save(new File(dir,"first-map.json"),c);javax.imageio.ImageIO.write(p.getLCD(),"png",new File(dir,"first-map.png"));System.out.println("MAP_DUMPED");break;}}catch(Exception e){System.out.println("step="+i+" canvas="+c.getClass().getName()+" detail="+e.getClass().getSimpleName());}
            fire(p);
        }
        System.exit(0);
    }
}
