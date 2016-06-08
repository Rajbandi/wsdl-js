/* Copyright (C) Raj Bandi
 * Written by Raj Bandi <raj.bandi@hotmail.com>, June 2016
 */

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

if (!Object.isNullOrEmpty) {
    Object.isNullOrEmpty = function (obj) {

        return obj == null || obj == 'undefined' || obj == '';
    };
}

function util() {

}

util.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

util.xml2json = function (xml) {
    var x2js = new X2JS();
    var json = x2js.xml2json(xml);
    return json;
}

util.json2xml = function (json) {
    var x2js = new X2JS();
    var xml = x2js.json2xml(json);
    return xml;
}
 
function constants() {

}

constants.SOAP_HEADER = "Header";
constants.SOAP_BODY = "Body";
constants.SOAP_ENVELOPE = "Envelope";
constants.XML_TYPES = ["string", "boolean", "decimal", "float", "double", "dateTime", "time", "date", "gYearMonth", "gDay", "gMonth", "hexBinary", "base64Binary", "anyURI", "QName"];
constants.PREFIX = "__prefix";
constants.TEXT = "__text";
constants.AUTH_HEADER = "Authorization";
constants.AUTH_BEARER = "Bearer {0}"
constants.SOAP_ACTION = "SOAPAction";
constants.CONTENT_TYPE = "Content-Type";
constants.PATTERN_URL = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
constants.TARGET_NAMESPACE = "_targetNamespace";
constants.SOAP_NAMESPACE = "_xmlns:soap";
constants.X_NAMESPACE = "_xmlns:x";
constants.NAMESPACE = "_xmlns";


            function wsdl(url)
            {
                this.url = url;
                
                this.operations = [];
                this.namespaces = {};
                this.importNamespaces = {};
                this.attributes = [];
                this.messages = [];
                this.simpleTypes = [];
                this.complexTypes = [];
                this.elements = [];
                this.imports = [];
                this.source = '';
                this.json = '';
                
            }
            
            wsdl.prototype.clear = function()
            {
                this.operations = [];
                this.namespaces = {};
                this.attributes = [];
                this.messages = [];
                this.simpleTypes = [];
                this.complexTypes = [];
                this.elements = [];
                this.imports = [];
                this.source = '';
                this.json = '';
            }
            
             wsdl.prototype.export = function(obj)
            {
                var obj = {};
                
                obj.operations = this.operations;
                obj.attributes = this.attributes;
                obj.messages = this.messages;
                obj.simpleTypes = this.simpleTypes;
                obj.complexTypes = this.complexTypes;
                obj.elements = this.elements;
                obj.imports = this.imports;
                obj.source = this.source;
                obj.json = this.json;
                obj.url = this.url;
                
                return obj;
            }
            
            wsdl.prototype.import = function(obj)
            {
                this.operations = obj.operations;
                this.attributes = obj.attributes;
                this.messages = obj.messages;
                this.simpleTypes = obj.simpleTypes;
                this.complexTypes = obj.complexTypes;
                this.elements = obj.elements;
                this.imports = obj.imports;
                this.source = obj.source;
                this.json = obj.json;
                this.url = obj.url;
            }
            
            wsdl.prototype.update = function(url)
            {
                this.url = url;
                return this.load();
            }
            
            wsdl.prototype.load = function()
            {
                this.clear();
                
                 var that = this;
                return new Promise(function(resolve, reject){
                
                      $.get( that.url, function( data ) {
                            that.source = data;
                            var json = util.xml2json(data);
                            that.json = json;
                            that.parse(json).then(function(){
                                
                                        
                                resolve();
                            }, function(err){ reject(err); });
                    }).fail(function(error){
                        reject(error);
                    });
                    
                });
            }

            wsdl.prototype.createRequest = function(operation)
            {
                var xml = '';
               if(!Object.isNullOrEmpty(operation))
               {
                   
                   var env = {};
                   
                   var obj = {};

                   obj[constants.SOAP_HEADER] = {};
                   
                   
                   obj[constants.SOAP_BODY] = operation.input;
                   env[constants.SOAP_ENVELOPE] = obj;
                   
                   var h = obj[constants.SOAP_HEADER];
                   var b = obj[constants.SOAP_BODY];
                   var e = env[constants.SOAP_ENVELOPE];
                   
                   e[constants.X_NAMESPACE]= "http://schemas.xmlsoap.org/soap/envelope/"; 
                   //this.namespaces[constants.SOAP_NAMESPACE]+constants.SOAP_ENVELOPE.toLowerCase()+"/";
                   var keys = Object.keys(this.importNamespaces);
                   var that = this;
                   keys.forEach(function(key){
                      if(key.startsWith(constants.NAMESPACE))
                      {
                          e[key] = that.importNamespaces[key];
                      } 
                   });
                   e[constants.PREFIX] = "x";
                   h[constants.PREFIX] = "x";
                   b[constants.PREFIX] = "x";
                   //console.log(JSON.stringify(env));
                   var xml = util.json2xml(env);
                   var s = new XMLSerializer();
                   operation.xml =s.serializeToString(xml); 
                   operation.json = env;
               } 
               
               return xml; 
            }   
            
            wsdl.prototype.createRequestByName = function(name)
            {
               
               var operation = $.grep(this.operations, function(op){
                   return op.name === name;
               })[0];

               createRequest(operation);
                
                
            }   
            
                     
            wsdl.prototype.parse = function(data)
            {
                var that = this;
                return new Promise(function(resolve, reject){
                        try
                        {
                        var messages= data.definitions.message;
                        var keys = Object.keys(data.definitions);
                        keys.forEach(function(key){
                           if(key.startsWith("_xmlns:"))
                           {
                                that.namespaces[key] = data.definitions[key];   
                           }
                            
                        });
                        that.namespaces[constants.TARGET_NAMESPACE] = data.definitions[constants.TARGET_NAMESPACE];   
                        that.processImports(data.definitions.types).then(function(){
                            that.processMessages(data.definitions).then(function(){
                                
                            that.processSoapOperations(data.definitions).then(function(){
                              
                                resolve();
                            }, function(err){
                                reject(err);
                            });          
                            
                            //end of process messages
                            }, function(err){
                                reject(err);
                            });
                    
                            }, function(err){
                                reject(err);
                            });
                            
                        }
                        catch(e)
                        {
                            reject(Error('Parse error :'+e));
                        }
                });
            }
            
           wsdl.prototype.processImports = function(types)
            {
               var that = this;
               var promises = [];
               var schemaTypes = [];
               if(!Object.isNullOrEmpty(types.schema))
               {
                   var imports = types.schema.import;
                   if(!Object.isNullOrEmpty(imports))
                   {
                       imports.forEach(function(x){
                          promises.push(that.processImport(x._schemaLocation))       
                       });
                   }
               }
               
               return  Promise.all(promises);
            }
            
            wsdl.prototype.processImport = function (url)
            {
                var that = this;
                return new Promise(function(resolve, reject)
                {
                   $.get(url, function(data){ 
                                 var x2js = new X2JS();
                                    var json = x2js.xml2json(data);
                                    if(!Object.isNullOrEmpty(json) && !Object.isNullOrEmpty(json.schema))
                                    {
                                        var schema = json.schema;
                                        if(!Object.isNullOrEmpty(schema.element))
                                        {
                                            $.merge(that.elements,schema.element);
                                        }
                                        if(!Object.isNullOrEmpty(schema.import))
                                        {
                                            $.merge(that.imports,schema.import);
                                        }
                                        if(!Object.isNullOrEmpty(schema.attribute))
                                        {
                                            $.merge(that.attributes,schema.attribute);
                                        }
                                        if(!Object.isNullOrEmpty(schema.simpleType))
                                        {
                                            $.merge(that.simpleTypes,schema.simpleType);
                                        }
                                        if(!Object.isNullOrEmpty(schema.complexType))
                                        {
                                            $.merge(that.complexTypes,schema.complexType);
                                        }
                                    }
                                    
                                    resolve();
                                    
                            }).fail(function(err) {
                                reject(err);
                            });
                                    });
 
            }
            
              wsdl.prototype.processMessages = function (def)
            {
                
                  var that = this;
                return new Promise(function(resolve, reject){
                   try{
                
                if(!Object.isNullOrEmpty(def.message))
                {
                    var messages = def.message;
                    if(!Object.isNullOrEmpty(messages))
                    {
                        messages.forEach(function(message){
                            var msg = {};
                            msg["name"] = message._name;
                                
                            if(!Object.isNullOrEmpty(message.part))
                            {
                              
                                var el = message.part["_element"];
                                var type = that.getTypeName(el);
                                msg[constants.PREFIX] = type.prefix;
                                   
                            }
                            
                            that.messages.push(msg);
                        });
                        
                        resolve();
                    }
                    }
                   }
                   catch(e)
                   {
                       reject(e);
                   }
                });
                
            }
            
            wsdl.prototype.processSoapOperations = function (def)
            {
                var promises = [];
                var that = this;
               
                
                if(!Object.isNullOrEmpty(def.binding))
                {
                    var binding = def.binding;
                    if(!Object.isNullOrEmpty(binding))
                    {
                        var operations = binding.operation;
                        if(!Object.isNullOrEmpty(operations))
                        {
                            operations.forEach(function(operation){
                                promises.push(that.processOperation(operation));         
                            });
                        }
                    }
                }
                               
                
                return Promise.all(promises);
            }
            
            wsdl.prototype.processOperation = function(operation)
            {
                var that = this;
                return new Promise(function(resolve, reject){
                   try{
                        var soapAction = operation.operation._soapAction;
                        var input = operation.input._name;
                       
                        var obj = that.processObject(input);
                        var message = $.grep(that.messages, function(msg){
                           return msg.name === input; 
                        })[0];
                        
                        if(!Object.isNullOrEmpty(message))
                        {
                            obj[constants.PREFIX] = message[constants.PREFIX];
                        }
                        var inputObj = {};
                        inputObj[input] = obj;
                        
                        that.operations.push({name:operation._name, soapAction:soapAction, input:inputObj});
                        resolve();
                   }
                   catch(e)
                   {
                       reject(Error('Error while processing operation'+e));
                   } 
                });  
            }
         
            wsdl.prototype.processObject = function(name)
            {
                var obj = {};
                var that = this;
                var type = $.grep(this.elements, function(x){
                   return x._name == name; 
                })[0];
                
                if(!Object.isNullOrEmpty(type))
                {
                    var complexType = type.complexType
                    if(!Object.isNullOrEmpty(complexType))
                    {
                        var sequence = complexType.sequence;
                        if(!Object.isNullOrEmpty(sequence))
                        {
                            var elements = sequence.element;
                            if(!Object.isNullOrEmpty(elements) )
                            {
                                if( util.isArray(elements))
                                {
                                    elements.forEach(function(element){
                                        
                                        var el = that.processComplexType(element._name)
                                        obj[element._name] = el;
                                      
                                    });
                                }
                                else
                                {
                                     var el = that.processComplexType(elements._name)
                                        obj[elements._name] = el;
                                        
                                }
                            }
                        }
                    }
                }
                return obj;
            }

            wsdl.prototype.getTypeName = function (elType)
            {
                var typeName = {};
                
                var tokens = elType.split(':');
                var typeName;
                if(tokens.length>1)
                {
                    typeName.prefix = tokens[0];
                    typeName.name = tokens[1];
                }
                else
                if(tokens.length>0)
                {
                    typeName.prefix = '';
                    typeName.name = tokens[0];
                }
                
                return typeName;
            }
                        
             wsdl.prototype.processComplexType = function (name)
            {
                var obj = {};
                var that = this;
                var type = $.grep(that.complexTypes, function(x){
                   return x._name == name; 
                })[0];
                if(!Object.isNullOrEmpty(type))
                {
                        var sequence = type.sequence;
                        if(!Object.isNullOrEmpty(sequence))
                        {
                            var elements = sequence.element;
                            if(!Object.isNullOrEmpty(elements))
                            {
                               if( util.isArray(elements))
                                {
                                    elements.forEach(function(element){
                                        that.processComplexObj(obj, element);
                                    });
                                }
                                else
                                {
                                   that.processComplexObj(obj, elements);
                                }
                            }
                        }
                }                
                return obj;    
            }
            
             wsdl.prototype.processComplexObj = function (obj, element)
            {
                var elType = element._type;
                
                var typeName = this.getTypeName(elType);
                if(!Object.isNullOrEmpty(typeName))
                {
                    if(constants.XML_TYPES.indexOf(typeName.name)>=0)
                    {
                        obj[element._name] = "";
                    }
                    else
                    {
                    
                        obj[element._name] = this.processComplexType(typeName.name);
                    }
                    
                    this.processNamespaces(obj, element);
                }
            }

            wsdl.prototype.processNamespaces = function(obj, element)
            {
                var elType = element._type;
                var typeName = this.getTypeName(elType);
                var prefix = typeName.prefix;
                if(!Object.isNullOrEmpty(prefix))
                {
                    var key = String.format("{0}:{1}",constants.NAMESPACE, prefix);
                    var ns = element[key];
                    if(Object.isNullOrEmpty(ns))
                    {
                        ns = this.namespaces[key];
                        if(!Object.isNullOrEmpty(ns))
                        {
                            obj[constants.PREFIX] = prefix;
                            this.importNamespaces[key] = ns;    
                        }
                    }
                    else
                    {
                            obj[constants.PREFIX] = prefix;
                            obj[key] = ns;       
                    }
                } 
            }
            
            
wsdl.prototype.createRequests = function()
{
    var that = this;
 
    that.operations.forEach(function(operation){
        
        that.createRequest(operation);
      
       //operation.xml = s.serializeToString(xml);
         
    });  
}

