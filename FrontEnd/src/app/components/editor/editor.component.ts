import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

// Ace Editor
import * as ace from 'ace-builds';

// Languages
import 'ace-builds/src-min-noconflict/mode-c_cpp';
import 'ace-builds/src-min-noconflict/mode-java';
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/mode-python';

// Themes
import 'ace-builds/src-noconflict/theme-ambiance';
import 'ace-builds/src-noconflict/theme-chaos';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-clouds';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-cobalt';
import 'ace-builds/src-noconflict/theme-crimson_editor';
import 'ace-builds/src-noconflict/theme-dawn';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-dreamweaver';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-gob';
import 'ace-builds/src-noconflict/theme-gruvbox';
import 'ace-builds/src-noconflict/theme-idle_fingers';
import 'ace-builds/src-noconflict/theme-iplastic';
import 'ace-builds/src-noconflict/theme-katzenmilch';
import 'ace-builds/src-noconflict/theme-kr_theme';
import 'ace-builds/src-noconflict/theme-kuroir';
import 'ace-builds/src-noconflict/theme-merbivore';
import 'ace-builds/src-noconflict/theme-merbivore_soft';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-mono_industrial';
import 'ace-builds/src-noconflict/theme-nord_dark';
import 'ace-builds/src-noconflict/theme-pastel_on_dark';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-solarized_light';
import 'ace-builds/src-noconflict/theme-sqlserver';
import 'ace-builds/src-noconflict/theme-terminal';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-tomorrow_night_blue';
import 'ace-builds/src-noconflict/theme-tomorrow_night_bright';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-vibrant_ink';
import 'ace-builds/src-noconflict/theme-xcode';

// External Features
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';

// Services
import { AdminService } from 'src/app/Shared/admin.service';
import { UserService } from 'src/app/Shared/user.service';
import { ApiService } from 'src/app/Shared/api.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})

export class EditorComponent implements OnInit {

  @ViewChild('codeEditor', { static: true }) codeEditorElmRef: ElementRef;
  private codeEditor: ace.Ace.Editor;
  private editorBeautify;
  
  public modes;
  public themes;

  private selected_theme: String;
  private selected_mode: String;

  public stdInputEnabled: Boolean = false;
  public hitCompile: Boolean = false;


  //Scope - After compilation
  public stdin:any;
  public stdout:any;
  public stderr:any;
  public isSuccess:boolean;
  public genResult:String;
  public memoryUsage: Number;
  public timeTaken: Number;
  public tmpStyle: String;
  private retVal:any;

  constructor(private AdminData: AdminService, public UserData: UserService, public apiService:ApiService) { }

  // Configurations options
  /**
   * @returns - all options that editor is configured to
   */
  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { enableBasicAutocompletion?: boolean; } {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 14,
      maxLines: 20,
      wrap: 1
    };

    const extraEditorOptions = {
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      autoScrollEditorIntoView: true,
    };
    
    const mergedOptions = Object.assign(basicEditorOptions, extraEditorOptions);
    return mergedOptions;
  }
  

  /**
   * Sets the code editor theme according to user selection
   * @param theme - selected theme of type any
   */
  public setTheme(theme: any) {
    console.log("selected theme is " + theme);
    if(!theme)
      theme = this.UserData.giveTheme();
      // console.log(theme);
    this.codeEditor.setTheme(theme);
    this.selected_theme = theme;
  }

  /**
   * Set the mode to user's prefferd programmin language
   * @param mode - this is selected programming language mode
   */
  public setMode(mode: any) {
    if(!mode)
      this.UserData.giveMode();
    this.codeEditor.getSession().setMode(`ace/mode/${mode}`);
    this.selected_mode = mode;
  }


  /**
   * Toggels the stdin panel upon the click 
   */
  public toggleStdin() {
    this.stdInputEnabled = !this.stdInputEnabled;
  }
  
  ngOnInit(): void {
    document.getElementById('editor').style.fontFamily='Consolas';
    this.UserData.currentData.subscribe(data => {
      console.log(data);
    });

    // Pre-reqs
    this.modes = this.AdminData.giveModes();
    this.themes = this.AdminData.giveThemes();

    this.selected_mode = this.UserData.giveMode();
    this.selected_theme = this.UserData.giveTheme();

    ace.require('ace/ext/language_tools');
    ace.config.set('basePath', '/libs/ace');
    this.editorBeautify = ace.require('ace/ext/beautify');

    const element = this.codeEditorElmRef.nativeElement;
    const editorOptions: Partial<ace.Ace.EditorOptions> = this.getEditorOptions();

    // Configuration
    this.codeEditor = ace.edit(element, editorOptions);

    // Theme
    this.setTheme(this.selected_theme);
    // Language
    this.setMode(this.selected_mode);

    // for the scope fold feature
    this.codeEditor.setShowFoldWidgets(true);

    // Font-Size
    element.style.fontSize='18px';
  }

  /**
   * @description 
   * beautifies the editor's content, rely on Ace Beautify Extension
   */
  public beautifyContent() {
    if (this.codeEditor && this.editorBeautify) {
      const session = this.codeEditor.getSession();
      this.editorBeautify.beautify(session);
    }
  }

  /**
   * Clears the code editor content
   */
  public clearCode() {
    this.hitCompile = false;
    this.codeEditor.setValue('');
  }

  /**
   * @returns - the current ediort's content
   */
  get getCode() {
    return this.codeEditor.getValue();
  }
  

  /**
   * @description - Calls Compile API through service and configures 
   * the Code Editor accordingly.
   * 
   */
  public compileRun() {
    let code = this.getCode;
    if(code === '') {
      alert("Code editor is empty!");
      return;
    }
    this.hitCompile = true;
    console.log(code);
    var codeObj = {
      code: code,
      language: this.selected_mode,
      stdin: this.stdin
    }
    console.log(codeObj);
    this.apiService.compileRun(codeObj).subscribe(res => {
      this.retVal = res;
      console.log(this.retVal);
      if(this.retVal.stderr !== '') {
        // TODO : make stderr var and assign it, interpolate in html
        this.stderr = this.retVal.stderr;
        console.log(this.stderr);
        this.isSuccess = false;
        this.tmpStyle = "color: red;"
        this.genResult = this.retVal.errorType +  " error";
        // TODO: Add exit code in stderr variable , also set error type runtime/compile time
      }else{
        this.isSuccess = true;
        this.memoryUsage = this.retVal.memoryUsage;
        this.tmpStyle = "color: green;"
        this.genResult = "Success";
        // TODO: timeTaken 
      }
      if(this.retVal.stdout == '') {
        this.stdout = "stdout is empty";
      }else{
        this.stdout = this.retVal.stdout;
      }
    });
    
    // TODO: declare variable for same and use interpolation timeout for program execution in milliseconds. 
    // TODO: Done same for the memoryUsage
    setTimeout(()=> {
      // this.codeEditor.setReadOnly(true); editor.scrollToLine(50, true, true, function () {});
      // this.codeEditor.scrollToLine(50, true, true,()=>{});
    }, 2000);
    
  }
}